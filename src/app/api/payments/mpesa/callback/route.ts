import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  validateCallback,
  parseCallback,
  getPaymentByCheckoutRequestId,
  updatePaymentStatus,
  handlePaymentSuccess,
} from '@/lib/payments';

/**
 * M-Pesa STK Push Callback
 * This endpoint receives payment notifications from Safaricom
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    // Validate callback structure
    if (!validateCallback(body)) {
      console.error('Invalid callback structure');
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Invalid callback structure' },
        { status: 400 }
      );
    }

    // Parse callback data
    const callbackData = parseCallback(body);

    // Find the payment by checkout request ID
    const payment = await getPaymentByCheckoutRequestId(callbackData.checkoutRequestId);

    if (!payment) {
      console.error('Payment not found for checkout ID:', callbackData.checkoutRequestId);
      return NextResponse.json(
        { ResultCode: 0, ResultDesc: 'Accepted' } // Still return success to M-Pesa
      );
    }

    // Determine payment status based on result code
    const isSuccess = callbackData.resultCode === 0;

    // Update payment record
    await updatePaymentStatus(
      payment.id,
      isSuccess ? 'completed' : 'failed',
      {
        result_code: callbackData.resultCode,
        result_description: callbackData.resultDesc,
        mpesa_receipt_number: callbackData.mpesaReceiptNumber || null,
        provider_reference: callbackData.mpesaReceiptNumber || null,
        metadata: {
          transactionDate: callbackData.transactionDate,
          phoneNumber: callbackData.phoneNumber,
          amount: callbackData.amount,
        },
      }
    );

    // If successful, update gem status
    if (isSuccess) {
      await handlePaymentSuccess(payment.id);
      console.log('Payment successful:', {
        paymentId: payment.id,
        receipt: callbackData.mpesaReceiptNumber,
      });
    } else {
      console.log('Payment failed:', {
        paymentId: payment.id,
        resultCode: callbackData.resultCode,
        resultDesc: callbackData.resultDesc,
      });
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);

    // Still return success to M-Pesa to prevent retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
}

// M-Pesa may also send GET requests for validation
export async function GET() {
  return NextResponse.json({ status: 'OK' });
}
