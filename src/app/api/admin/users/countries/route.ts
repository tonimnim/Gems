import { NextResponse } from 'next/server';
import { getUserCountries } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/api/admin-auth';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const countries = await getUserCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching user countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
