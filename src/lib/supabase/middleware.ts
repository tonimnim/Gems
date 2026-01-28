import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not remove this line
  // This refreshes the session if expired and sets new cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle mobile redirects
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);

  if (pathname === '/' && isMobile) {
    const url = request.nextUrl.clone();
    url.pathname = '/m';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/m') && !isMobile) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/m' ? '/' : pathname.replace('/m', '');
    return NextResponse.redirect(url);
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/gems/new', '/gems/edit'];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
