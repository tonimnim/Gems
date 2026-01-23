import { NextResponse } from 'next/server';
import { getUserCountries } from '@/lib/api/admin';

export async function GET() {
  try {
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
