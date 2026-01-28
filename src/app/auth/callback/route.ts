import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Collect cookies to set
  const cookiesToSet: { name: string; value: string; options: any }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach((cookie) => cookiesToSet.push(cookie));
      },
    },
  });

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Exchange error:', error.message);
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  // Force a getUser call to trigger cookie setting
  await supabase.auth.getUser();

  // Create redirect response and set cookies
  const response = NextResponse.redirect(`${origin}${redirect}`);

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
