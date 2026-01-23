import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiatePayment } from '@/lib/payments';
import { PRICING } from '@/constants';

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { gemId, tier, type, phoneNumber } = body;

    // Validate required fields
    if (!gemId || !tier || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: gemId, tier, type' },
        { status: 400 }
      );
    }

    // Validate phone number for M-Pesa
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required for M-Pesa payments' },
        { status: 400 }
      );
    }

    // Verify gem ownership
    const { data: gem, error: gemError } = await supabase
      .from('gems')
      .select('id, owner_id, name')
      .eq('id', gemId)
      .single();

    if (gemError || !gem) {
      return NextResponse.json(
        { error: 'Gem not found' },
        { status: 404 }
      );
    }

    if (gem.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this gem' },
        { status: 403 }
      );
    }

    // Calculate amount based on tier and term
    const pricing = tier === 'featured' ? PRICING.featured : PRICING.standard;
    const termMonths = PRICING.term_months; // 6 months
    const amount = pricing.per_term;

    // Initiate payment
    const result = await initiatePayment({
      gemId,
      userId: user.id,
      amount,
      currency: 'KES',
      type,
      provider: 'mpesa',
      phoneNumber,
      termMonths,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      checkoutRequestId: result.checkoutRequestId,
      message: result.message,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
