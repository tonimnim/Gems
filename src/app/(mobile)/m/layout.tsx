'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const MOBILE_BREAKPOINT = 768;

const navItems = [
  { href: '/m', icon: Home, label: 'Home' },
  { href: '/m/explore', icon: Compass, label: 'Explore' },
  { href: '/m/saved', icon: Heart, label: 'Saved' },
  { href: '/m/profile', icon: User, label: 'Profile', authRequired: true },
];

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
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

      {/* Bottom Navigation - fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 max-w-md mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/m' && pathname.startsWith(item.href));
            // Redirect to login if auth required and not authenticated
            const href = item.authRequired && !isAuthenticated ? '/login' : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center h-full transition-colors touch-feedback w-[25%]',
                  isActive ? 'text-[#00AA6C]' : 'text-gray-400'
                )}
              >
                <item.icon
                  className={cn(
                    'h-6 w-6',
                    isActive && item.icon !== User && 'fill-current'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="h-safe-bottom bg-white" />
      </nav>
    </div>
  );
}
