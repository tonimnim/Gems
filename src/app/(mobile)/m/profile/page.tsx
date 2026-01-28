'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Gem,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface MenuItemProps {
  href?: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

function MenuItem({ href, icon: Icon, label, description, onClick, variant = 'default' }: MenuItemProps) {
  const content = (
    <div className="flex items-center gap-4 px-4 py-3.5 touch-feedback">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        variant === 'danger' ? 'bg-red-50' : 'bg-gray-100'
      }`}>
        <Icon className={`h-5 w-5 ${
          variant === 'danger' ? 'text-red-500' : 'text-gray-600'
        }`} />
      </div>
      <div className="flex-1">
        <p className={`font-medium ${
          variant === 'danger' ? 'text-red-600' : 'text-gray-900'
        }`}>
          {label}
        </p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      {href && <ChevronRight className="h-5 w-5 text-gray-400" />}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/m/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/m');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00AA6C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = user.full_name || 'User';
  const userEmail = user.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Admin' : 'Visitor';

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white pt-safe border-b border-gray-100">
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      {/* User Info */}
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={userName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-[#00AA6C] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{userInitial}</span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
            <p className="text-sm text-gray-500">{userEmail}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#00AA6C]/10 text-[#00AA6C] text-xs font-medium rounded-full">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action - Only show for owners */}
      {user.role === 'owner' && (
        <div className="px-4 py-4">
          <Link
            href="/gems/new"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#00AA6C] text-white font-medium rounded-xl touch-feedback"
          >
            <Plus className="h-5 w-5" />
            List a New Gem
          </Link>
        </div>
      )}

      {/* Menu Sections */}
      <div className="bg-white border-t border-b border-gray-100">
        <MenuItem
          href="/dashboard"
          icon={Gem}
          label="My Gems"
          description="Manage your listings"
        />
        <div className="h-px bg-gray-100 ml-[72px]" />
        <MenuItem
          href="/payments"
          icon={CreditCard}
          label="Payments"
          description="Billing & transactions"
        />
      </div>

      <div className="h-3" />

      <div className="bg-white border-t border-b border-gray-100">
        <MenuItem
          href="/m/settings"
          icon={Settings}
          label="Settings"
        />
        <div className="h-px bg-gray-100 ml-[72px]" />
        <MenuItem
          href="/help"
          icon={HelpCircle}
          label="Help & Support"
        />
      </div>

      <div className="h-3" />

      <div className="bg-white border-t border-b border-gray-100">
        <MenuItem
          icon={LogOut}
          label="Sign Out"
          onClick={handleSignOut}
          variant="danger"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-400">Gems v1.0.0</p>
      </div>
    </div>
  );
}
