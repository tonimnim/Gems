'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gem,
  Clock,
  CheckCircle,
  DollarSign,
  ChevronRight,
  MapPin,
  User as UserIcon,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PageHeader, StatsCard } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCachedData, useCacheStore } from '@/lib/cache';
import { createClient } from '@/lib/supabase/client';
import type { Gem as GemType, GemMedia, Payment as PaymentType } from '@/types';

// Types
interface PendingGem extends GemType {
  media?: GemMedia[];
}

interface Payment extends PaymentType {
  gem?: {
    name: string;
  };
}

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  created_at: string;
}

interface AdminStats {
  totalGems: number;
  pendingReview: number;
  activeGems: number;
  revenueThisMonth: number;
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Helper to get category display name
function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    eat_drink: 'Eat & Drink',
    nature: 'Nature',
    stay: 'Stay',
    culture: 'Culture',
    adventure: 'Adventure',
    entertainment: 'Entertainment',
  };
  return categoryMap[category] || category;
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper to format currency
function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Payment status icon component
function PaymentStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'refunded':
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <CreditCard className="h-4 w-4 text-gray-400" />;
  }
}

export default function AdminDashboardPage() {
  const cache = useCacheStore();

  // Fetch stats
  const fetchStats = useCallback(async (): Promise<AdminStats> => {
    const supabase = createClient();

    const [gemsResult, pendingResult, activeResult, paymentsResult] = await Promise.all([
      supabase.from('gems').select('*', { count: 'exact', head: true }),
      supabase.from('gems').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('gems').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    const revenue = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      totalGems: gemsResult.count || 0,
      pendingReview: pendingResult.count || 0,
      activeGems: activeResult.count || 0,
      revenueThisMonth: revenue,
    };
  }, []);

  // Fetch pending gems
  const fetchPendingGems = useCallback(async (): Promise<PendingGem[]> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('gems')
      .select('*, media:gem_media(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);
    return (data || []) as PendingGem[];
  }, []);

  // Fetch recent payments
  const fetchPayments = useCallback(async (): Promise<Payment[]> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('payments')
      .select('*, gem:gems(name)')
      .order('created_at', { ascending: false })
      .limit(5);
    return (data || []) as Payment[];
  }, []);

  // Fetch recent users (owners)
  const fetchUsers = useCallback(async (): Promise<User[]> => {
    const supabase = createClient();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, created_at')
      .in('role', ['owner', 'admin'])
      .gte('created_at', oneWeekAgo)
      .order('created_at', { ascending: false })
      .limit(5);
    return (data || []) as User[];
  }, []);

  // Use cached data
  const { data: statsData, isLoading: statsLoading, isValidating, refetch: refetchAll } = useCachedData({
    key: 'admin-dashboard-stats',
    fetcher: fetchStats,
  });

  const { data: pendingGemsData } = useCachedData({
    key: 'admin-dashboard-pending',
    fetcher: fetchPendingGems,
  });

  const { data: paymentsData } = useCachedData({
    key: 'admin-dashboard-payments',
    fetcher: fetchPayments,
  });

  const { data: usersData } = useCachedData({
    key: 'admin-dashboard-users',
    fetcher: fetchUsers,
  });

  const stats = statsData || { totalGems: 0, pendingReview: 0, activeGems: 0, revenueThisMonth: 0 };
  const pendingGems = pendingGemsData || [];
  const recentPayments = paymentsData || [];
  const recentUsers = usersData || [];

  const handleRefresh = () => {
    cache.invalidatePrefix('admin-dashboard');
    refetchAll();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of your gems platform"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isValidating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 bg-white shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Gems"
              value={stats.totalGems.toLocaleString()}
              icon={Gem}
            />
            <StatsCard
              title="Pending Review"
              value={stats.pendingReview.toLocaleString()}
              icon={Clock}
              variant="warning"
            />
            <StatsCard
              title="Active Gems"
              value={stats.activeGems.toLocaleString()}
              icon={CheckCircle}
              variant="success"
            />
            <StatsCard
              title="Revenue This Month"
              value={formatCurrency(stats.revenueThisMonth)}
              icon={DollarSign}
            />
          </>
        )}
      </div>

      {/* Pending Verification Section */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <CardTitle>Pending Verification</CardTitle>
            {stats.pendingReview > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {stats.pendingReview}
              </Badge>
            )}
          </div>
          <CardAction>
            <Link href="/anthonychege599/verify">
              <Button variant="ghost" size="sm" className="text-[#00AA6C] hover:text-[#008855]">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingGems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                All caught up!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No gems pending verification at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="pb-3 pr-4">Gem</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Submitted</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingGems.slice(0, 5).map((gem) => {
                    const coverImage = gem.media?.find((m) => m.is_cover)?.url || gem.media?.[0]?.url;
                    return (
                      <tr key={gem.id} className="group">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {coverImage ? (
                                <Image
                                  src={coverImage}
                                  alt={gem.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Gem className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{gem.name}</p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {getCategoryDisplayName(gem.category)}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span>{gem.city}, {gem.country}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(gem.created_at)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/anthonychege599/verify?id=${gem.id}`}>
                            <Button
                              size="sm"
                              className="bg-[#00AA6C] hover:bg-[#008855]"
                            >
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Recent Payments & New Owners */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No recent payments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3"
                  >
                    <PaymentStatusIcon status={payment.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {payment.gem?.name || 'Unknown gem'}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Owners This Week */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>New Owners This Week</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserIcon className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No new owners this week
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? undefined} />
                      <AvatarFallback className="bg-[#00AA6C]/10 text-[#00AA6C]">
                        {getInitials(user.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {user.full_name || 'Anonymous User'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatRelativeTime(user.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
