import { NextRequest, NextResponse } from 'next/server';
import { getPayments, type PaymentFilters } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: PaymentFilters = {
      status: (searchParams.get('status') as PaymentFilters['status']) || 'all',
      dateRange: (searchParams.get('dateRange') as PaymentFilters['dateRange']) || 'all',
      provider: (searchParams.get('provider') as PaymentFilters['provider']) || 'all',
      search: searchParams.get('search') || undefined,
    };

    const result = await getPayments(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
