'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Gem as GemIcon,
  Star,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PageHeader,
  DataTable,
  GemFilters,
  GemFiltersSkeleton,
} from '@/components/admin';
import type { Column } from '@/components/admin';
import {
  getGems,
  getUniqueCountries,
  deleteGem,
  type AdminGemFilters,
} from '@/lib/api/admin';
import { GEM_CATEGORIES, AFRICAN_COUNTRIES } from '@/constants';
import { formatDate } from '@/lib/utils';
import type { Gem, GemStatus, GemCategory, GemMedia } from '@/types';
import { toast } from 'sonner';

interface GemWithMedia extends Gem {
  media?: GemMedia[];
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

export default function GemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [gems, setGems] = useState<GemWithMedia[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalGems, setTotalGems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gemToDelete, setGemToDelete] = useState<Gem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current page and filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const filters: AdminGemFilters = {
    status: (searchParams.get('status') as GemStatus | 'all') || 'all',
    category: (searchParams.get('category') as GemCategory | 'all') || 'all',
    country: searchParams.get('country') || undefined,
    search: searchParams.get('search') || undefined,
  };

  // Fetch gems data
  const fetchGems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [gemsData, countriesData] = await Promise.all([
        getGems(filters, currentPage, 10),
        getUniqueCountries(),
      ]);

      setGems(gemsData.data as GemWithMedia[]);
      setTotalGems(gemsData.total);
      setTotalPages(gemsData.total_pages);
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching gems:', error);
      toast.error('Failed to load gems');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters.status, filters.category, filters.country, filters.search]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/gems?${params.toString()}`);
  };

  // Handle delete
  const handleDeleteClick = (gem: Gem) => {
    setGemToDelete(gem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!gemToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteGem(gemToDelete.id);
      if (result.success) {
        toast.success('Gem deleted successfully');
        fetchGems();
      } else {
        toast.error(result.error || 'Failed to delete gem');
      }
    } catch (error) {
      console.error('Error deleting gem:', error);
      toast.error('Failed to delete gem');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setGemToDelete(null);
    }
  };

  // Get cover image
  const getCoverImage = (gem: GemWithMedia): string | null => {
    const coverMedia = gem.media?.find((m) => m.is_cover);
    return coverMedia?.url || gem.media?.[0]?.url || null;
  };

  // Get country name
  const getCountryName = (code: string): string => {
    const country = AFRICAN_COUNTRIES.find((c) => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  // Table columns
  const columns: Column<GemWithMedia>[] = [
    {
      key: 'thumbnail',
      header: '',
      className: 'w-[60px]',
      cell: (gem) => {
        const imageUrl = getCoverImage(gem);
        return (
          <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={gem.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <GemIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Name',
      className: 'min-w-[200px]',
      cell: (gem) => (
        <div>
          <Link
            href={`/admin/gems/${gem.id}`}
            className="font-medium text-gray-900 hover:text-[#00AA6C] hover:underline"
          >
            {gem.name}
          </Link>
          <p className="text-sm text-gray-500">
            {gem.city}, {getCountryName(gem.country)}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (gem) => (
        <Badge variant="outline" className="font-normal">
          {GEM_CATEGORIES[gem.category]?.label || gem.category}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (gem) => (
        <Badge className={statusStyles[gem.status]}>
          {gem.status.charAt(0).toUpperCase() + gem.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      cell: (gem) => (
        <Badge className={tierStyles[gem.tier]}>
          {gem.tier.charAt(0).toUpperCase() + gem.tier.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      className: 'text-center',
      cell: (gem) => (
        <div className="flex items-center justify-center gap-1 text-gray-600">
          <Eye className="h-4 w-4" />
          <span>{gem.views_count.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      className: 'text-center',
      cell: (gem) => (
        <div className="flex items-center justify-center gap-1 text-gray-600">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{gem.average_rating.toFixed(1)}</span>
          <span className="text-gray-400">({gem.ratings_count})</span>
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (gem) => (
        <span className="text-gray-600">{formatDate(gem.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      cell: (gem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/gem/${gem.id}`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Page
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/gems/${gem.id}`}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(gem)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="All Gems"
        description={
          isLoading
            ? 'Loading...'
            : `${totalGems} gem${totalGems !== 1 ? 's' : ''} total`
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && gems.length === 0 ? (
            <GemFiltersSkeleton />
          ) : (
            <GemFilters countries={countries} />
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={gems}
        isLoading={isLoading}
        emptyState={{
          icon: <GemIcon className="h-7 w-7 text-gray-400" />,
          title: 'No gems found',
          description:
            filters.status !== 'all' ||
            filters.category !== 'all' ||
            filters.country ||
            filters.search
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'There are no gems in the system yet.',
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalGems,
          itemsPerPage: 10,
          onPageChange: handlePageChange,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gem</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{gemToDelete?.name}&quot;?
              This action cannot be undone. All associated media, ratings, and
              favorites will also be deleted.
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
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
