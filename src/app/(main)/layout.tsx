'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useTrackPageView } from '@/hooks/use-track-pageview';

const MOBILE_BREAKPOINT = 768;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Track page views
  useTrackPageView();

  // Pages that should NOT redirect to mobile (responsive web pages)
  const noMobileRedirect = ['/', '/team', '/privacy', '/terms', '/traffic'];

  // Fast redirect for mobile users to /m
  useEffect(() => {
    const checkDevice = () => {
      // Skip redirect for certain pages
      if (noMobileRedirect.includes(pathname)) return;

      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (isMobile) {
        // Redirect to mobile view
        const mobilePath = `/m${pathname === '/' ? '' : pathname}`;
        router.replace(mobilePath);
      }
    };

    // Check immediately
    checkDevice();

    // Also listen for resize (for dev tools toggle)
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [pathname, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
