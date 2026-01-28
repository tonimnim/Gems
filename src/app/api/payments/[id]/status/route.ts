import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { querySTKPushStatus } from '@/lib/payments/mpesa';
import { handlePaymentSuccess, handlePaymentFailure } from '@/lib/payments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;
    const supabase = await createClient();

    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, provider_reference, checkout_request_id')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If payment is still pending and we have a checkout ID, query M-Pesa directly
    if (payment.status === 'pending' && payment.checkout_request_id) {
      try {
        const mpesaStatus = await querySTKPushStatus(payment.checkout_request_id);

        // ResultCode 0 = Success, 1032 = Cancelled by user, others = failed
        if (mpesaStatus.resultCode === 0) {
          // Payment succeeded - update our records
          await handlePaymentSuccess(paymentId, {
            resultCode: 0,
            resultDesc: mpesaStatus.resultDesc,
            mpesaReceiptNumber: 'QUERY_' + Date.now(), // We don't get receipt from query
          });

          return NextResponse.json({
            status: 'completed',
            receipt: null,
          });
        } else if (mpesaStatus.resultCode === 1032) {
          // User cancelled
          await handlePaymentFailure(paymentId, 'Payment cancelled by user');

          return NextResponse.json({
            status: 'failed',
            error: 'Payment cancelled',
          });
        } else if (mpesaStatus.resultCode !== 1) {
          // Other failure (resultCode 1 means "pending/processing")
          await handlePaymentFailure(paymentId, mpesaStatus.resultDesc);

          return NextResponse.json({
            status: 'failed',
            error: mpesaStatus.resultDesc,
          });
        }
        // resultCode 1 means still processing, return pending
      } catch (queryError) {
        // Query failed, just return current DB status
        console.error('M-Pesa query failed:', queryError);
      }
    }

    return NextResponse.json({
      status: payment.status,
      receipt: payment.provider_reference,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
