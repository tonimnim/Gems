import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { VerificationQueue } from './VerificationQueue';
import { VerificationSkeleton } from './VerificationSkeleton';

export const dynamic = 'force-dynamic';

async function getGems(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('gems')
    .select(`
      *,
      owner:profiles!gems_owner_id_fkey(
        id,
        email,
        full_name,
        avatar_url
      ),
      media:gem_media(
        id,
        url,
        type,
        is_cover,
        order
      )
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching gems:', error);
    return [];
  }

  return data || [];
}

async function getPendingCount() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('gems')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending count:', error);
    return 0;
  }

  return count || 0;
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || 'pending';

  const [gems, pendingCount] = await Promise.all([
    getGems(status),
    getPendingCount(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<VerificationSkeleton />}>
          <VerificationQueue
            gems={gems}
            pendingCount={pendingCount}
            currentStatus={status}
          />
        </Suspense>
      </div>
    </div>
  );
}
