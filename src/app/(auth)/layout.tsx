'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Skip redirect for complete-profile page (user needs to finish setup)
    if (pathname === '/complete-profile') return;

    // If user is logged in, redirect them away from auth pages
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'owner' || user.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated && pathname !== '/complete-profile') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
      </div>
    );
  }

  return <>{children}</>;
}
