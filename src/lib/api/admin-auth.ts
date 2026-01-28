import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Verify the request is from an authenticated admin user
 * Returns the user if authorized, or an error response
 */
export async function requireAdmin(): Promise<
  | { authorized: true; user: { id: string; email: string } }
  | { authorized: false; response: NextResponse }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { id: user.id, email: user.email || '' },
  };
}
