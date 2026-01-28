'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useTrackPageView() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Don't track same path twice in same session
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);

    // Determine page type
    let page = 'other';
    if (pathname === '/' || pathname === '/m') {
      page = 'home';
    } else if (pathname.startsWith('/explore') || pathname.startsWith('/m/explore')) {
      page = 'explore';
    } else if (pathname.startsWith('/gem/') || pathname.startsWith('/m/gem/')) {
      page = 'gem_detail';
    } else if (pathname === '/login' || pathname === '/register') {
      page = 'auth';
    } else if (pathname === '/dashboard') {
      page = 'dashboard';
    } else if (pathname === '/traffic') {
      page = 'traffic';
    } else if (pathname === '/team') {
      page = 'team';
    }

    // Track the page view
    fetch('/api/traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      }),
    }).catch((err) => {
      console.error('Failed to track page view:', err);
    });
  }, [pathname]);
}
