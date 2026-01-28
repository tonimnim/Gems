import { NextRequest, NextResponse } from 'next/server';
import {
  validateCallback,
  parseCallback,
  getPaymentByCheckoutRequestId,
  handlePaymentSuccess,
  handlePaymentFailure,
} from '@/lib/payments';

/**
 * M-Pesa STK Push Callback
 * This endpoint receives payment notifications from Safaricom
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Handle based on result code
    if (callbackData.resultCode === 0) {
      await handlePaymentSuccess(payment.id, {
        resultCode: callbackData.resultCode,
        resultDesc: callbackData.resultDesc,
        mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
      });
    } else {
      await handlePaymentFailure(payment.id, callbackData.resultDesc);
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
