'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

// Instantly create user from auth data (no network request)
function createUserFromAuth(authUser: SupabaseUser): User {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email ?? null,
    full_name: metadata.full_name || metadata.name || null,
    avatar_url: metadata.avatar_url || metadata.picture || null,
    role: metadata.role || 'visitor', // Default, will be updated from DB
    country: metadata.country || null,
    created_at: authUser.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch actual role from database (background)
  const updateUserRole = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, country')
        .eq('id', userId)
        .single();

      if (profile) {
        setUser(prev => prev ? { ...prev, role: profile.role, country: profile.country } : null);
      }
    } catch {
      // Silent fail - user already has default role
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const userData = createUserFromAuth(session.user);
      setUser(userData);
      // Await role update from database
      await updateUserRole(session.user.id);
    } else {
      setUser(null);
    }
  }, [updateUserRole]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Initialize - instant from session storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        // Instantly show user from auth metadata
        const userData = createUserFromAuth(session.user);
        setUser(userData);
        setIsLoading(false);

        // Fetch actual role in background
        updateUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const userData = createUserFromAuth(session.user);
            setUser(userData);
            updateUserRole(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUserRole]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signOut,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
