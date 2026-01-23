import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get payment status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get payment (only if owned by user)
    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, status, provider, mpesa_receipt_number, result_description, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      provider: payment.provider,
      receiptNumber: payment.mpesa_receipt_number,
      message: payment.result_description,
      createdAt: payment.created_at,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
