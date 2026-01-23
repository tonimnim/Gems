'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create Supabase client only on client-side
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return createClient();
    } catch {
      console.warn('Supabase client could not be created. Auth features will be disabled.');
      return null;
    }
  }, []);

  const fetchUser = async (userId: string) => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data as User;
  };

  const refreshUser = async () => {
    if (!supabase) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const userData = await fetchUser(authUser.id);
      setUser(userData);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const userData = await fetchUser(authUser.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await fetchUser(session.user.id);
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
