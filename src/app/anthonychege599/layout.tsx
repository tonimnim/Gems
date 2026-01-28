'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Gem } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/admin/Sidebar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Only this email can access the admin panel
const ADMIN_EMAIL = 'anthonychege599@gmail.com';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00AA6C] border-t-transparent" />
        <p className="text-sm text-[#6B7280]">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      if (!user) {
        setIsCheckingAccess(false);
        return;
      }

      // Check if user email matches admin email (case-insensitive)
      const userEmail = user.email?.toLowerCase();
      if (!userEmail || userEmail !== ADMIN_EMAIL.toLowerCase()) {
        router.push('/');
        return;
      }

      const supabase = createClient();

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create one from auth data
      if (error || !profileData) {
        // Try to insert profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: 'admin', // Set as admin since email matched
          });

        if (insertError) {
          console.error('Failed to create profile:', insertError);
        }

        // Use auth data as fallback
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || 'Admin',
          avatar_url: user.avatar_url || undefined,
          role: 'admin',
        });
      } else {
        setProfile(profileData);
      }

      // Fetch pending gems count for badge
      const { count } = await supabase
        .from('gems')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setPendingCount(count || 0);
      setIsCheckingAccess(false);
    }

    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        checkAdminAccess();
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading || isCheckingAccess) {
    return <LoadingState />;
  }

  // Don't render if no user (redirect will happen)
  if (!user || !profile) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar profile={profile} pendingCount={pendingCount} />
      </div>

      {/* Mobile Header */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#092327]">
            <Gem className="h-5 w-5 text-[#34E0A1]" />
          </div>
          <span className="font-semibold text-[#111827]">Gems Admin</span>
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5 text-[#111827]" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[#092327]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <Sidebar profile={profile} pendingCount={pendingCount} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Spacer for mobile header */}
        <div className="h-16 lg:hidden" />

        {/* Page Content - Centered with max-width */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
