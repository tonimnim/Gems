'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Star,
  Eye,
  Calendar,
  User,
  Check,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, RejectModal } from '@/components/admin';
import {
  getGemById,
  updateGem,
  updateGemStatus,
  deleteGem,
} from '@/lib/api/admin';
import { GEM_CATEGORIES, AFRICAN_COUNTRIES } from '@/constants';
import { formatDate } from '@/lib/utils';
import type { Gem, GemStatus, GemCategory, GemTier, GemMedia, User as UserType } from '@/types';
import { toast } from 'sonner';

interface GemWithDetails extends Gem {
  media?: GemMedia[];
  owner?: UserType;
}

// Status badge colors
const statusStyles: Record<GemStatus, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Tier badge styles
const tierStyles: Record<string, string> = {
  standard: 'bg-gray-100 text-gray-700 border-gray-200',
  featured: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function GemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gemId = params.id as string;

  // State
  const [gem, setGem] = useState<GemWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedGem, setEditedGem] = useState<Partial<Gem>>({});

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Fetch gem data
  const fetchGem = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getGemById(gemId);
      setGem(data as GemWithDetails);
      setEditedGem(data || {});
    } catch (error) {
      console.error('Error fetching gem:', error);
      toast.error('Failed to load gem details');
    } finally {
      setIsLoading(false);
    }
  }, [gemId]);

  useEffect(() => {
    fetchGem();
  }, [fetchGem]);

  // Handle edit mode
  const handleEdit = () => {
    setEditedGem(gem || {});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedGem(gem || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!gem) return;

    setIsSaving(true);
    try {
      const result = await updateGem(gem.id, editedGem);
      if (result.success) {
        toast.success('Gem updated successfully');
        await fetchGem();
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update gem');
      }
    } catch (error) {
      console.error('Error updating gem:', error);
      toast.error('Failed to update gem');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!gem) return;

    setIsApproving(true);
    try {
      const result = await updateGemStatus(gem.id, 'approved');
      if (result.success) {
        toast.success('Gem approved successfully');
        await fetchGem();
      } else {
        toast.error(result.error || 'Failed to approve gem');
      }
    } catch (error) {
      console.error('Error approving gem:', error);
      toast.error('Failed to approve gem');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle reject
  const handleReject = async (reason: string, notes: string) => {
    if (!gem) return;

    setIsRejecting(true);
    try {
      const rejectionReason = notes ? `${reason}: ${notes}` : reason;
      const result = await updateGemStatus(gem.id, 'rejected', rejectionReason);
      if (result.success) {
        toast.success('Gem rejected');
        await fetchGem();
        setRejectModalOpen(false);
      } else {
        toast.error(result.error || 'Failed to reject gem');
      }
    } catch (error) {
      console.error('Error rejecting gem:', error);
      toast.error('Failed to reject gem');
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!gem) return;

    setIsDeleting(true);
    try {
      const result = await deleteGem(gem.id);
      if (result.success) {
        toast.success('Gem deleted successfully');
        router.push('/admin/gems');
      } else {
        toast.error(result.error || 'Failed to delete gem');
      }
    } catch (error) {
      console.error('Error deleting gem:', error);
      toast.error('Failed to delete gem');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Get cover image
  const getCoverImage = (): string | null => {
    if (!gem?.media) return null;
    const coverMedia = gem.media.find((m) => m.is_cover);
    return coverMedia?.url || gem.media[0]?.url || null;
  };

  // Get country info
  const getCountryInfo = (code: string) => {
    return AFRICAN_COUNTRIES.find((c) => c.code === code);
  };

  // Loading state
  if (isLoading) {
    return <GemDetailSkeleton />;
  }

  // Not found
  if (!gem) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Gem not found</h2>
        <p className="mt-2 text-gray-500">The gem you are looking for does not exist.</p>
        <Link href="/admin/gems">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gems
          </Button>
        </Link>
      </div>
    );
  }

  const coverImage = getCoverImage();
  const country = getCountryInfo(gem.country);

  return (
    <div className="space-y-6">
      {/* Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/gems">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Gems
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {gem.status === 'pending' && !isEditing && (
            <>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectModalOpen(true)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Link href={`/gem/${gem.id}`} target="_blank">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
              <Button variant="outline" onClick={handleEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Basic Information</span>
                <div className="flex gap-2">
                  <Badge className={statusStyles[gem.status]}>
                    {gem.status.charAt(0).toUpperCase() + gem.status.slice(1)}
                  </Badge>
                  <Badge className={tierStyles[gem.tier]}>
                    {gem.tier.charAt(0).toUpperCase() + gem.tier.slice(1)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editedGem.name || ''}
                      onChange={(e) =>
                        setEditedGem({ ...editedGem, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editedGem.description || ''}
                      onChange={(e) =>
                        setEditedGem({ ...editedGem, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={editedGem.category}
                        onValueChange={(value) =>
                          setEditedGem({ ...editedGem, category: value as GemCategory })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GEM_CATEGORIES).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tier">Tier</Label>
                      <Select
                        value={editedGem.tier}
                        onValueChange={(value) =>
                          setEditedGem({ ...editedGem, tier: value as GemTier })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="featured">Featured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editedGem.status}
                        onValueChange={(value) =>
                          setEditedGem({ ...editedGem, status: value as GemStatus })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_range">Price Range</Label>
                      <Input
                        id="price_range"
                        value={editedGem.price_range || ''}
                        onChange={(e) =>
                          setEditedGem({ ...editedGem, price_range: e.target.value })
                        }
                        placeholder="e.g., $$ - $$$"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{gem.name}</h2>
                    <p className="mt-2 text-gray-600">{gem.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {GEM_CATEGORIES[gem.category]?.label || gem.category}
                    </Badge>
                    {gem.price_range && (
                      <Badge variant="outline">
                        <DollarSign className="mr-1 h-3 w-3" />
                        {gem.price_range}
                      </Badge>
                    )}
                  </div>

                  {gem.rejection_reason && gem.status === 'rejected' && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <h4 className="font-medium text-red-800">Rejection Reason</h4>
                      <p className="mt-1 text-sm text-red-600">{gem.rejection_reason}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={editedGem.country}
                        onValueChange={(value) =>
                          setEditedGem({ ...editedGem, country: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {AFRICAN_COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editedGem.city || ''}
                        onChange={(e) =>
                          setEditedGem({ ...editedGem, city: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editedGem.address || ''}
                      onChange={(e) =>
                        setEditedGem({ ...editedGem, address: e.target.value })
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{gem.address}</p>
                      <p className="text-gray-500">
                        {gem.city}, {country?.flag} {country?.name || gem.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editedGem.phone || ''}
                        onChange={(e) =>
                          setEditedGem({ ...editedGem, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedGem.email || ''}
                        onChange={(e) =>
                          setEditedGem({ ...editedGem, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editedGem.website || ''}
                      onChange={(e) =>
                        setEditedGem({ ...editedGem, website: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opening_hours">Opening Hours</Label>
                    <Textarea
                      id="opening_hours"
                      value={editedGem.opening_hours || ''}
                      onChange={(e) =>
                        setEditedGem({ ...editedGem, opening_hours: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {gem.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{gem.phone}</span>
                    </div>
                  )}
                  {gem.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <a
                        href={`mailto:${gem.email}`}
                        className="text-[#00AA6C] hover:underline"
                      >
                        {gem.email}
                      </a>
                    </div>
                  )}
                  {gem.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a
                        href={gem.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00AA6C] hover:underline"
                      >
                        {gem.website}
                      </a>
                    </div>
                  )}
                  {gem.opening_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                      <p className="whitespace-pre-line text-gray-600">{gem.opening_hours}</p>
                    </div>
                  )}
                  {!gem.phone && !gem.email && !gem.website && !gem.opening_hours && (
                    <p className="text-gray-500 italic">No contact information provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {gem.media && gem.media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {gem.media.map((media) => (
                    <div
                      key={media.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      <Image
                        src={media.url}
                        alt={gem.name}
                        fill
                        className="object-cover"
                      />
                      {media.is_cover && (
                        <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
                          Cover
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & Owner Info */}
        <div className="space-y-6">
          {/* Cover Image */}
          {coverImage && (
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={coverImage}
                  alt={gem.name}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          )}

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="h-5 w-5" />
                  <span>Views</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {gem.views_count.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>Rating</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {gem.average_rating.toFixed(1)} ({gem.ratings_count} reviews)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>Created</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatDate(gem.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>Updated</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatDate(gem.updated_at)}
                </span>
              </div>

              {gem.current_term_end && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>Term Ends</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatDate(gem.current_term_end)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Info Card */}
          {gem.owner && (
            <Card>
              <CardHeader>
                <CardTitle>Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{gem.owner.full_name}</p>
                    <p className="text-sm text-gray-500">{gem.owner.email}</p>
                  </div>
                </div>
                <Link href={`/admin/users/${gem.owner.id}`} className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    View Owner Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gem</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{gem.name}&quot;? This action
              cannot be undone. All associated media, ratings, and favorites will
              also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onReject={handleReject}
        gemName={gem.name}
        isLoading={isRejecting}
      />
    </div>
  );
}

// Loading skeleton
function GemDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
