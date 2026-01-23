'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import type { User as UserType } from '@/types';

export interface BottomNavProps {
  user?: UserType | null;
}

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: ROUTES.home, icon: Home },
    { name: 'Explore', href: ROUTES.explore, icon: Compass },
    { name: 'Add', href: user ? ROUTES.newGem : ROUTES.register, icon: Plus, isAction: true },
    { name: 'Favorites', href: ROUTES.favorites, icon: Heart },
    { name: 'Profile', href: user ? ROUTES.dashboard : ROUTES.login, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--background)] border-t border-[var(--card-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--foreground-muted)]'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
