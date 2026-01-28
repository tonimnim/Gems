'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle,
  Gem,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/context/notification-context';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/anthonychege599', icon: LayoutDashboard },
  { name: 'Notifications', href: '/anthonychege599/notifications', icon: Bell, badge: 0 },
  { name: 'Verify', href: '/anthonychege599/verify', icon: CheckCircle, badge: 0 },
  { name: 'Gems', href: '/anthonychege599/gems', icon: Gem },
  { name: 'Users', href: '/anthonychege599/users', icon: Users },
  { name: 'Payments', href: '/anthonychege599/payments', icon: CreditCard },
  { name: 'Settings', href: '/anthonychege599/settings', icon: Settings },
];

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

interface SidebarProps {
  profile?: UserProfile | null;
  pendingCount?: number;
}

export function Sidebar({ profile, pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Update nav items with badges
  const navItems = NAV_ITEMS.map((item) => {
    if (item.name === 'Verify') {
      return { ...item, badge: pendingCount };
    }
    if (item.name === 'Notifications') {
      return { ...item, badge: unreadCount };
    }
    return item;
  });

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#092327]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00AA6C]">
          <Gem className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white">Gems</span>
          <span className="text-xs text-white/60">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/anthonychege599' && pathname.startsWith(`${item.href}/`));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border-l-2 border-[#00AA6C] bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-[#34E0A1]' : 'text-white/50'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#00AA6C] px-1.5 text-xs font-semibold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-[#00AA6C] text-white text-sm">
                {profile?.full_name ? getInitials(profile.full_name) : 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {profile?.full_name || 'Admin User'}
              </p>
              <p className="truncate text-xs text-white/50">
                {profile?.email || 'admin@example.com'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/anthonychege599/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export default Sidebar;
