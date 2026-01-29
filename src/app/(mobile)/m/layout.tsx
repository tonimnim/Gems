'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/mobile';

const MOBILE_BREAKPOINT = 768;

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(true); // Assume mobile first

  // Fast redirect for desktop users
  useEffect(() => {
    const checkDevice = () => {
      const isDesktop = window.innerWidth >= MOBILE_BREAKPOINT;
      if (isDesktop) {
        // Redirect to web view, converting /m/... to /...
        const webPath = pathname.replace(/^\/m/, '') || '/';
        router.replace(webPath);
      } else {
        setIsMobile(true);
      }
    };

    // Check immediately
    checkDevice();

    // Also listen for resize (for dev tools toggle)
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative">
      {/* Main content area - scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
