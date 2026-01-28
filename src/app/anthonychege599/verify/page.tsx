'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Globe,
  ImageIcon,
  CheckCircle2,
  Eye,
  RefreshCw,
  Gem as GemIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RejectModal } from '@/components/admin/RejectModal';
import { toast } from 'sonner';
import { useCachedData, useCacheStore } from '@/lib/cache';
import { createClient } from '@/lib/supabase/client';
import type { Gem, GemMedia } from '@/types';

// Category emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  eat_drink: '🍽️',
  nature: '🌿',
  stay: '🏨',
  culture: '🏛️',
  adventure: '🧗',
  entertainment: '🎭',
};

const CATEGORY_LABELS: Record<string, string> = {
  eat_drink: 'Eat & Drink',
  nature: 'Nature & Outdoors',
  stay: 'Stay',
  culture: 'Culture & History',
  adventure: 'Adventure',
  entertainment: 'Entertainment',
};

interface PendingGemWithDetails extends Omit<Gem, 'owner'> {
  media?: GemMedia[];
  owner?: {
    full_name: string | null;
    email: string | null;
  };
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function PendingGemCard({
  gem,
  onApprove,
  onReject,
  isProcessing,
}: {
  gem: PendingGemWithDetails;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}) {
  const descriptionLimit = 200;
  const truncatedDescription =
    gem.description && gem.description.length > descriptionLimit
      ? gem.description.slice(0, descriptionLimit) + '...'
      : gem.description || '';

  const coverImage = gem.media?.find((m) => m.is_cover)?.url || gem.media?.[0]?.url;
  const photoCount = gem.media?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image or Placeholder */}
        <div className="flex-shrink-0 w-full md:w-[150px] h-[150px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={gem.name}
              width={150}
              height={150}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">{CATEGORY_EMOJIS[gem.category] || '💎'}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row with name, category, and tier */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{gem.name}</h3>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
              {CATEGORY_LABELS[gem.category] || gem.category}
            </Badge>
            <Badge
              className={`text-xs ${
                gem.tier === 'featured'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {gem.tier === 'featured' ? 'Featured' : 'Standard'}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>
              {gem.city}, {gem.country}
            </span>
          </div>

          {/* Submitted by */}
          <p className="text-sm text-gray-500 mb-3">
            Submitted by: <span className="font-medium text-gray-700">{gem.owner?.full_name || 'Unknown'}</span>{' '}
            <span className="text-gray-400">•</span> {gem.owner?.email || 'No email'}{' '}
            <span className="text-gray-400">•</span> {formatRelativeTime(gem.created_at)}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
            {truncatedDescription}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>
                {photoCount} photo{photoCount !== 1 ? 's' : ''}
              </span>
            </div>
            {gem.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{gem.phone}</span>
              </div>
            )}
            {gem.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{gem.website}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onApprove(gem.id)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(gem.id)}
              disabled={isProcessing}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Reject
            </Button>
            <Link href={`/gem/${gem.id}`} target="_blank">
              <Button size="sm" variant="outline" className="text-gray-600">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
      <p className="text-gray-500">There are no pending gems to review at the moment.</p>
    </div>
  );
}

export default function AdminVerifyPage() {
  const cache = useCacheStore();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);

  // Fetch pending gems with caching
  const fetchPendingGems = useCallback(async (): Promise<PendingGemWithDetails[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('gems')
      .select(`
        *,
        media:gem_media(*),
        owner:profiles!gems_owner_id_fkey(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending gems:', error);
      return [];
    }

    return data as PendingGemWithDetails[];
  }, []);

  const {
    data: pendingGemsData,
    isLoading,
    isValidating,
    refetch
  } = useCachedData({
    key: 'admin-pending-gems',
    fetcher: fetchPendingGems,
  });
  const pendingGems = pendingGemsData || [];

  const selectedGem = pendingGems.find((g) => g.id === selectedGemId);

  const handleApprove = async (gemId: string) => {
    setProcessingId(gemId);

    try {
      const supabase = createClient();

      // Get gem details for notification
      const gem = pendingGems.find(g => g.id === gemId);

      const { error } = await supabase
        .from('gems')
        .update({ status: 'approved' })
        .eq('id', gemId);

      if (error) throw error;

      // Send notification to owner to complete payment
      if (gem?.owner_id) {
        await supabase.from('notifications').insert({
          user_id: gem.owner_id,
          type: 'gem_approved',
          title: 'Your Gem is Approved!',
          message: `Great news! "${gem.name}" has been approved. Complete payment to make it visible to the public.`,
          data: {
            gem_id: gem.id,
            gem_name: gem.name,
            action_url: `/gems/${gem.id}/pay`,
          },
        });
      }

      toast.success('Gem approved successfully!');
      cache.invalidate('admin-pending-gems');
      refetch();
    } catch (error) {
      console.error('Error approving gem:', error);
      toast.error('Failed to approve gem');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (gemId: string) => {
    setSelectedGemId(gemId);
    setRejectModalOpen(true);
  };

  const handleReject = async (reason: string, notes: string) => {
    if (!selectedGemId) return;

    setProcessingId(selectedGemId);

    try {
      const supabase = createClient();
      const rejectionReason = `${reason}${notes ? `: ${notes}` : ''}`;

      // Get gem details for notification
      const gem = pendingGems.find(g => g.id === selectedGemId);

      const { error } = await supabase
        .from('gems')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedGemId);

      if (error) throw error;

      // Send notification to owner about rejection
      if (gem?.owner_id) {
        await supabase.from('notifications').insert({
          user_id: gem.owner_id,
          type: 'gem_rejected',
          title: 'Gem Not Approved',
          message: `Unfortunately, "${gem.name}" was not approved. Reason: ${rejectionReason}`,
          data: {
            gem_id: gem.id,
            gem_name: gem.name,
            rejection_reason: rejectionReason,
          },
        });
      }

      toast.success('Gem rejected successfully');
      cache.invalidate('admin-pending-gems');
      refetch();
    } catch (error) {
      console.error('Error rejecting gem:', error);
      toast.error('Failed to reject gem');
    } finally {
      setRejectModalOpen(false);
      setSelectedGemId(null);
      setProcessingId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Gems</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? 'Loading...' : `${pendingGems.length} pending submission${pendingGems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isValidating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          {isValidating ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Pending Gems List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-[#00AA6C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingGems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {pendingGems.map((gem) => (
            <PendingGemCard
              key={gem.id}
              gem={gem}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              isProcessing={processingId === gem.id}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedGemId(null);
        }}
        onReject={handleReject}
        gemName={selectedGem?.name || ''}
        isLoading={!!processingId}
      />
    </div>
  );
}
