import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Mobile device detection
function isMobileDevice(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    userAgent
  );
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = isMobileDevice(userAgent);

  // Mobile device detection for root path
  // If mobile user visits "/", redirect to "/m"
  // If desktop user visits "/m", redirect to "/"
  if (pathname === '/') {
    if (isMobile) {
      const url = request.nextUrl.clone();
      url.pathname = '/m';
      return NextResponse.redirect(url);
    }
  }

  // If desktop user tries to access /m routes, redirect to desktop equivalent
  if (pathname.startsWith('/m') && !isMobile) {
    const url = request.nextUrl.clone();
    // Map mobile routes to desktop equivalents
    if (pathname === '/m') {
      url.pathname = '/';
    } else if (pathname === '/m/explore') {
      url.pathname = '/explore';
    } else if (pathname === '/m/search') {
      url.pathname = '/search';
    } else if (pathname === '/m/saved') {
      url.pathname = '/favorites';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth checks if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey,
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

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/dashboard', '/gems', '/payments', '/verify', '/analytics'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Admin only routes
  const adminPaths = ['/verify', '/analytics'];
  const isAdminPath = adminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAdminPath && user) {
    // Check if user is admin (you'd need to fetch the user's role)
    // For now, we'll handle this in the page component
  }

  return supabaseResponse;
}
