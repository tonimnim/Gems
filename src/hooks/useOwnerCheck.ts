'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants';

/**
 * Hook to check if the current user can add a gem.
 * - If not logged in → redirect to login
 * - If logged in but not an owner with complete profile → redirect to complete-profile
 * - If owner with complete profile → allow action
 */
export function useOwnerCheck() {
  const router = useRouter();

  const checkAndRedirect = useCallback(async (): Promise<boolean> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Not logged in
    if (!user) {
      router.push(`${ROUTES.login}?redirect=${ROUTES.completeProfile}`);
      return false;
    }

    // Check profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, country')
      .eq('id', user.id)
      .single();

    // Not an owner or missing country → complete profile
    if (!profile || profile.role !== 'owner' || !profile.country) {
      router.push(ROUTES.completeProfile);
      return false;
    }

    // All good
    return true;
  }, [router]);

  return { checkAndRedirect };
}
