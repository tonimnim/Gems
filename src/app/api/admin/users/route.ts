import { NextRequest, NextResponse } from 'next/server';
import { getUsers, type UserFilters } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: UserFilters = {
      role: (searchParams.get('role') as UserFilters['role']) || undefined,
      country: searchParams.get('country') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const result = await getUsers(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
