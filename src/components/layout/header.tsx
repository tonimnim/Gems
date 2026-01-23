'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Gem, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ROUTES, GEM_CATEGORIES } from '@/constants';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Explore', href: ROUTES.explore },
  {
    label: 'Categories',
    href: '#',
    children: Object.entries(GEM_CATEGORIES).map(([key, cat]) => ({
      label: cat.label,
      href: `${ROUTES.explore}?category=${key}`,
    })),
  },
  { label: 'For Owners', href: ROUTES.register },
];

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092327]">
              <Gem className="h-4 w-4 text-[#34E0A1]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#00AA6C]">
                Hidden Gems
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 -mt-1">
                Africa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {link.children ? (
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00AA6C] transition-colors">
                    {link.label}
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      openDropdown === link.label && 'rotate-180'
                    )} />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-[#00AA6C]'
                        : 'text-gray-700 hover:text-[#00AA6C]'
                    )}
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown */}
                {link.children && openDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-2 w-48">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00AA6C] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={ROUTES.dashboard}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00AA6C] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <div className="py-2">
                      <span className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {link.label}
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="px-4 py-2 text-sm text-gray-700 hover:text-[#00AA6C] hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'block px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                        pathname === link.href
                          ? 'text-[#00AA6C] bg-[#34E0A1]/10'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <Link
                      href={ROUTES.dashboard}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
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
  );
}
