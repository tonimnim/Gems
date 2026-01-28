'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Gem, LogOut, LayoutDashboard, Heart, Bell, Building2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { NotificationBell } from '@/components/notifications';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BecomeOwnerModal } from '@/components/become-owner-modal';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBecomeOwnerModal, setShowBecomeOwnerModal] = useState(false);

  // Handle "For Owners" click
  const handleForOwnersClick = () => {
    if (!user) {
      // Not logged in - go to login with redirect
      router.push(`${ROUTES.login}?redirect=/dashboard&intent=owner`);
    } else if (user.role === 'owner' || user.role === 'admin') {
      // Already an owner - go to dashboard
      router.push(ROUTES.dashboard);
    } else {
      // Visitor - show upgrade modal
      setShowBecomeOwnerModal(true);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={ROUTES.home} className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092327]">
                <Gem className="h-4 w-4 text-[#34E0A1]" />
              </div>
              <span className="text-lg font-bold text-[#00AA6C]">
                Gems
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href={ROUTES.explore}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  pathname === ROUTES.explore
                    ? 'text-[#00AA6C]'
                    : 'text-gray-700 hover:text-[#00AA6C]'
                )}
              >
                Explore
              </Link>
              <Link
                href="/traffic"
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  pathname === '/traffic'
                    ? 'text-[#00AA6C]'
                    : 'text-gray-700 hover:text-[#00AA6C]'
                )}
              >
                Traffic
              </Link>
              <button
                onClick={handleForOwnersClick}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  pathname === ROUTES.dashboard
                    ? 'text-[#00AA6C]'
                    : 'text-gray-700 hover:text-[#00AA6C]'
                )}
              >
                {user?.role === 'owner' || user?.role === 'admin' ? 'Dashboard' : 'For Owners'}
              </button>
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2">
              {isLoading ? (
                <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
              ) : user ? (
                <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                    <Avatar className="h-9 w-9 border-2 border-transparent hover:border-[#00AA6C] transition-colors cursor-pointer">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-[#00AA6C] text-white text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {(user.role === 'owner' || user.role === 'admin') && (
                      <DropdownMenuItem asChild>
                        <Link href={ROUTES.dashboard} className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.favorites || '/favorites'} className="flex items-center gap-2 cursor-pointer">
                        <Heart className="h-4 w-4" />
                        Saved Gems
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'visitor' && (
                      <DropdownMenuItem
                        onClick={() => setShowBecomeOwnerModal(true)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Building2 className="h-4 w-4" />
                        Become an Owner
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.login}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00AA6C] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.register}
                    className="px-5 py-2.5 bg-[#092327] text-white text-sm font-semibold rounded-full hover:bg-[#11292E] transition-colors"
                  >
                    List Your Gem
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#00AA6C] transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-1">
                <Link
                  href={ROUTES.explore}
                  className={cn(
                    'block px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === ROUTES.explore
                      ? 'text-[#00AA6C] bg-[#34E0A1]/10'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explore
                </Link>
                <button
                  onClick={handleForOwnersClick}
                  className={cn(
                    'block px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left',
                    pathname === ROUTES.dashboard
                      ? 'text-[#00AA6C] bg-[#34E0A1]/10'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {user?.role === 'owner' || user?.role === 'admin' ? 'Dashboard' : 'For Owners'}
                </button>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      {/* User info */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-[#00AA6C] text-white">
                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      {(user.role === 'owner' || user.role === 'admin') && (
                        <Link
                          href={ROUTES.dashboard}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="/notifications"
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                      <Link
                        href={ROUTES.favorites || '/favorites'}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        Saved Gems
                      </Link>
                      {user.role === 'visitor' && (
                        <button
                          onClick={() => {
                            setShowBecomeOwnerModal(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg text-left"
                        >
                          <Building2 className="h-4 w-4" />
                          Become an Owner
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={ROUTES.login}
                        className="px-4 py-3 text-sm font-medium text-center text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href={ROUTES.register}
                        className="px-4 py-3 text-sm font-semibold text-center text-white bg-[#092327] rounded-full hover:bg-[#11292E]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        List Your Gem
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Become Owner Modal */}
      <BecomeOwnerModal
        open={showBecomeOwnerModal}
        onClose={() => setShowBecomeOwnerModal(false)}
      />
    </>
  );
}
