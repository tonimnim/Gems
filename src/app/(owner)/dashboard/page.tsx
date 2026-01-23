'use client';

import Link from 'next/link';
import { Eye, Star, Gem, CreditCard, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { ROUTES, PRICING } from '@/constants';
import { formatCurrency, daysUntilExpiry } from '@/lib/utils';
import type { Gem as GemType } from '@/types';

// Mock data
const mockGems: GemType[] = [
  {
    id: '1',
    owner_id: '1',
    name: 'The Secret Garden Restaurant',
    slug: 'secret-garden-restaurant',
    description: 'A hidden culinary paradise',
    category: 'eat_drink',
    country: 'KE',
    city: 'Nairobi',
    address: '123 Garden Lane',
    status: 'approved',
    tier: 'featured',
    views_count: 1250,
    average_rating: 4.8,
    ratings_count: 89,
    current_term_end: new Date(Date.now() + 86400000 * 45).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    owner_id: '1',
    name: 'Rooftop Lounge',
    slug: 'rooftop-lounge',
    description: 'Best views in the city',
    category: 'entertainment',
    country: 'KE',
    city: 'Nairobi',
    address: '456 Sky Tower',
    status: 'pending',
    tier: 'standard',
    views_count: 0,
    average_rating: 0,
    ratings_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockStats = {
  totalViews: 1250,
  totalRatings: 89,
  averageRating: 4.8,
  totalGems: 2,
};

export default function DashboardPage() {
  const { user } = useAuth();

  const gems = mockGems;
  const stats = mockStats;

  const getStatusBadge = (status: GemType['status']) => {
    const variants: Record<GemType['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      expired: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Owner'}
          </h1>
          <p className="text-[var(--foreground-muted)]">
            Manage your gems and track their performance
          </p>
        </div>
        <Link href={ROUTES.newGem}>
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Add New Gem
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[var(--primary)]/10">
                <Gem className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Total Gems</p>
                <p className="text-2xl font-bold">{stats.totalGems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[var(--info)]/10">
                <Eye className="h-6 w-6 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[var(--warning)]/10">
                <Star className="h-6 w-6 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[var(--success)]/10">
                <CreditCard className="h-6 w-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.totalRatings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold">Upgrade to Featured</h3>
            <p className="text-white/80 mt-1 mb-4">
              Get more visibility with a Featured listing at just{' '}
              {formatCurrency(PRICING.featured.per_term)}/term
            </p>
            <Link href={ROUTES.payments}>
              <Button className="bg-white text-[var(--primary)] hover:bg-white/90">
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold">Listing Pricing</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Standard</span>
                <span className="font-medium">
                  {formatCurrency(PRICING.standard.per_term)}/term
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Featured</span>
                <span className="font-medium">
                  {formatCurrency(PRICING.featured.per_term)}/term
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] pt-2">
                1 term = 6 months
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Gems */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Gems</CardTitle>
          <Link
            href="/gems"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {gems.length === 0 ? (
            <div className="text-center py-8">
              <Gem className="h-12 w-12 mx-auto text-[var(--foreground-muted)] mb-4" />
              <p className="text-[var(--foreground-muted)] mb-4">
                You haven&apos;t added any gems yet
              </p>
              <Link href={ROUTES.newGem}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Gem
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {gems.map((gem) => {
                const daysLeft = gem.current_term_end ? daysUntilExpiry(gem.current_term_end) : null;
                const isExpiringSoon = daysLeft !== null && daysLeft <= 30;

                return (
                  <div
                    key={gem.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[var(--card-border)] rounded-[var(--radius-lg)]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{gem.name}</h3>
                        {getStatusBadge(gem.status)}
                        {gem.tier === 'featured' && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {gem.city}, {gem.country}
                      </p>
                      {isExpiringSoon && gem.status === 'approved' && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-[var(--warning)]">
                          <AlertCircle className="h-4 w-4" />
                          <span>Expires in {daysLeft} days - Renew now</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-[var(--foreground-muted)]">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{gem.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{gem.average_rating.toFixed(1)}</span>
                      </div>
                      <Link href={ROUTES.editGem(gem.id)}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
