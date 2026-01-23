'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gem, CreditCard, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const sidebarLinks = [
  { name: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard },
  { name: 'My Gems', href: '/gems', icon: Gem },
  { name: 'Payments', href: ROUTES.payments, icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7]">
      <Header />

      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          className="fixed bottom-6 right-6 z-50 lg:hidden p-4 rounded-full bg-[#092327] text-white shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 pt-16 transition-transform duration-300 lg:translate-x-0 lg:static lg:pt-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Owner Dashboard
            </h2>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                      isActive
                        ? 'bg-[#092327] text-white'
                        : 'text-gray-600 hover:text-[#00AA6C] hover:bg-gray-50'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
