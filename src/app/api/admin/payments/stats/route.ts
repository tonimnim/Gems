import { NextResponse } from 'next/server';
import { getPaymentStats } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/api/admin-auth';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const stats = await getPaymentStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment stats' },
      { status: 500 }
    );
  }
}
