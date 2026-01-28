'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  ImageIcon,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RejectModal } from '@/components/admin/RejectModal';
import { GEM_CATEGORIES } from '@/constants';
import { approveGem, rejectGem } from './actions';
import type { Gem, GemMedia, User as UserType } from '@/types';

interface GemWithRelations extends Omit<Gem, 'owner' | 'media'> {
  owner: Pick<UserType, 'id' | 'email' | 'full_name' | 'avatar_url'> | null;
  media: GemMedia[];
}

interface VerificationQueueProps {
  gems: GemWithRelations[];
  pendingCount: number;
  currentStatus: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function GemVerificationCard({
  gem,
  onApprove,
  onReject,
  isProcessing,
}: {
  gem: GemWithRelations;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const coverImage = gem.media?.find((m) => m.is_cover)?.url || gem.media?.[0]?.url;
  const category = GEM_CATEGORIES[gem.category];
  const photoCount = gem.media?.filter((m) => m.type === 'image').length || 0;

  const descriptionLimit = 150;
  const isLongDescription = gem.description.length > descriptionLimit;
  const displayDescription = isExpanded
    ? gem.description
    : gem.description.slice(0, descriptionLimit);

  const getStatusColor = (status: Gem['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Cover Image */}
          <div className="relative w-full md:w-32 h-40 md:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={gem.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 128px"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h3 className="font-semibold text-lg text-[var(--foreground)] truncate">
                {gem.name}
              </h3>
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700"
              >
                {category?.label || gem.category}
              </Badge>
              {gem.tier === 'featured' && (
                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                  Featured
                </Badge>
              )}
              <Badge className={`text-xs ${getStatusColor(gem.status)}`}>
                {gem.status.charAt(0).toUpperCase() + gem.status.slice(1)}
              </Badge>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {gem.city}, {gem.country}
              </span>
            </div>

            {/* Owner Info */}
            <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)] mb-2">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{gem.owner?.full_name || 'Unknown Owner'}</span>
              </div>
              {gem.owner?.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{gem.owner.email}</span>
                </div>
              )}
            </div>

            {/* Submitted Time */}
            <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] mb-3">
              <Clock className="h-3.5 w-3.5" />
              <span>Submitted {formatRelativeTime(gem.created_at)}</span>
            </div>

            {/* Description */}
            <div className="mb-3">
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                {displayDescription}
                {isLongDescription && !isExpanded && '...'}
              </p>
              {isLongDescription && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-[var(--primary)] hover:underline mt-1 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--foreground-muted)] mb-4">
              <div className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
              </div>
              {gem.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{gem.phone}</span>
                </div>
              )}
              {gem.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{gem.website}</span>
                </div>
              )}
            </div>

            {/* Rejection Reason (if rejected) */}
            {gem.status === 'rejected' && gem.rejection_reason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Rejection reason:</strong> {gem.rejection_reason}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {gem.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onApprove(gem.id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(gem.id)}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              <Link href={`/gem/${gem.id}`} target="_blank">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VerificationQueue({
  gems,
  pendingCount,
  currentStatus,
}: VerificationQueueProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const selectedGem = gems.find((g) => g.id === selectedGemId);

  const handleStatusChange = (status: string) => {
    startTransition(() => {
      router.push(`/admin/verify?status=${status}`);
    });
  };

  const handleApprove = async (gemId: string) => {
    setProcessingId(gemId);
    try {
      const result = await approveGem(gemId);
      if (!result.success) {
        console.error('Failed to approve gem:', result.error);
      }
    } catch (error) {
      console.error('Error approving gem:', error);
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
      const result = await rejectGem(selectedGemId, reason, notes);
      if (!result.success) {
        console.error('Failed to reject gem:', result.error);
      }
      setRejectModalOpen(false);
      setSelectedGemId(null);
    } catch (error) {
      console.error('Error rejecting gem:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Gem Verification
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} pending
            </span>
          )}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Review and approve new gem submissions
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={currentStatus} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger
            value="all"
            onClick={() => handleStatusChange('all')}
            disabled={isPending}
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            onClick={() => handleStatusChange('pending')}
            disabled={isPending}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            onClick={() => handleStatusChange('approved')}
            disabled={isPending}
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            onClick={() => handleStatusChange('rejected')}
            disabled={isPending}
          >
            Rejected
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Gem List */}
      {gems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
              No gems to review
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {currentStatus === 'pending'
                ? 'All pending gems have been reviewed!'
                : `No ${currentStatus === 'all' ? '' : currentStatus + ' '}gems found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gems.map((gem) => (
            <GemVerificationCard
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
    </>
  );
}
