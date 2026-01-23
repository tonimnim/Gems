/**
 * Payment Service
 * Abstracts payment providers for easy integration
 */

import { createClient } from '@/lib/supabase/server';
import { initiateSTKPush, formatPhoneNumber } from './mpesa';
import type { PaymentInitRequest, PaymentInitResponse } from './types';
import { PRICING } from '@/constants';

export * from './types';
export * from './mpesa';

/**
 * Calculate term dates based on payment type
 */
function calculateTermDates(termMonths: number): { termStart: Date; termEnd: Date } {
  const termStart = new Date();
  const termEnd = new Date();
  termEnd.setMonth(termEnd.getMonth() + termMonths);

  return { termStart, termEnd };
}

/**
 * Generate account reference for M-Pesa
 */
function generateAccountReference(gemId: string): string {
  // Use first 8 chars of gem ID + timestamp
  const shortId = gemId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `GEM${shortId}`;
}

/**
 * Initiate a payment
 */
export async function initiatePayment(
  request: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const { gemId, userId, amount, currency, type, provider, phoneNumber, termMonths } = request;

  // Calculate term dates
  const { termStart, termEnd } = calculateTermDates(termMonths);

  // Create payment record in database first
  const supabase = await createClient();

  const { data: payment, error: dbError } = await supabase
    .from('payments')
    .insert({
      gem_id: gemId,
      user_id: userId,
      amount,
      currency,
      type,
      provider,
      phone_number: phoneNumber ? formatPhoneNumber(phoneNumber) : null,
      status: 'pending',
      term_start: termStart.toISOString(),
      term_end: termEnd.toISOString(),
    })
    .select()
    .single();

  if (dbError || !payment) {
    console.error('Failed to create payment record:', dbError);
    return {
      success: false,
      paymentId: '',
      message: 'Failed to create payment record',
    };
  }

  // Process based on provider
  if (provider === 'mpesa') {
    if (!phoneNumber) {
      return {
        success: false,
        paymentId: payment.id,
        message: 'Phone number is required for M-Pesa payments',
      };
    }

    try {
      const accountRef = generateAccountReference(gemId);
      const stkResponse = await initiateSTKPush({
        phoneNumber,
        amount,
        accountReference: accountRef,
        transactionDesc: `Hidden Gems - ${type.replace('_', ' ')}`,
      });

      // Update payment with M-Pesa checkout details
      await supabase
        .from('payments')
        .update({
          checkout_request_id: stkResponse.CheckoutRequestID,
          merchant_request_id: stkResponse.MerchantRequestID,
        })
        .eq('id', payment.id);

      return {
        success: true,
        paymentId: payment.id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        message: stkResponse.CustomerMessage,
      };
    } catch (error) {
      console.error('M-Pesa STK Push failed:', error);

      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          result_description: error instanceof Error ? error.message : 'STK Push failed',
        })
        .eq('id', payment.id);

      return {
        success: false,
        paymentId: payment.id,
        message: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    }
  }

  // Placeholder for other providers
  return {
    success: false,
    paymentId: payment.id,
    message: `Provider ${provider} is not yet implemented`,
  };
}

/**
 * Handle successful payment - update gem status
 */
export async function handlePaymentSuccess(paymentId: string): Promise<void> {
  const supabase = await createClient();

  // Get payment details
  const { data: payment, error } = await supabase
    .from('payments')
    .select('gem_id, term_start, term_end, type')
    .eq('id', paymentId)
    .single();

  if (error || !payment) {
    console.error('Failed to get payment:', error);
    return;
  }

  // Update gem with new term and status
  const updateData: Record<string, unknown> = {
    current_term_start: payment.term_start,
    current_term_end: payment.term_end,
    status: 'approved', // Auto-approve on payment (or keep pending for manual review)
  };

  // If upgrade, change tier
  if (payment.type === 'upgrade') {
    updateData.tier = 'featured';
  }

  await supabase.from('gems').update(updateData).eq('id', payment.gem_id);
}

/**
 * Get payment by checkout request ID (for M-Pesa callbacks)
 */
export async function getPaymentByCheckoutRequestId(checkoutRequestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('checkout_request_id', checkoutRequestId)
    .single();

  if (error) {
    console.error('Failed to get payment by checkout ID:', error);
    return null;
  }

  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  additionalData?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('payments')
    .update({
      status,
      ...additionalData,
    })
    .eq('id', paymentId);
}
