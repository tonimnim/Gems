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
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { StatsCard } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getAdminStats,
  getPendingGems,
  getRecentPayments,
  getRecentUsers
} from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Hidden Gems Africa Admin Dashboard',
};

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

export default async function AdminDashboardPage() {
  // Fetch all data in parallel
  const [stats, pendingGems, recentPayments, recentUsers] = await Promise.all([
    getAdminStats(),
    getPendingGems(5),
    getRecentPayments(5),
    getRecentUsers(5),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of Hidden Gems Africa platform metrics and activities
          </p>
        </div>

        {/* Stats Row */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Gems"
              value={stats.totalGems.toLocaleString()}
              icon={Gem}
              variant="default"
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
              variant="default"
            />
          </div>
        </section>

        {/* Pending Verification Preview */}
        <section className="mt-6 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <CardTitle>Pending Verification</CardTitle>
                {stats.pendingReview > 0 && (
                  <Badge
                    className="bg-amber-100 text-amber-700 border-amber-200"
                  >
                    {stats.pendingReview}
                  </Badge>
                )}
              </div>
              <CardAction>
                <Link href="/admin/gems/pending">
                  <Button variant="ghost" size="sm" className="text-[#00AA6C] hover:text-[#008855]">
                    See All
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
                <div className="divide-y">
                  {pendingGems.map((gem) => {
                    const coverImage = gem.media?.find((m) => m.is_cover)?.url || gem.media?.[0]?.url;
                    return (
                      <div
                        key={gem.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt={gem.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Gem className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-medium text-gray-900">
                            {gem.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {gem.city}, {gem.country}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryDisplayName(gem.category)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(gem.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0">
                          <Link href={`/admin/gems/${gem.id}/review`}>
                            <Button
                              size="sm"
                              className="bg-[#00AA6C] hover:bg-[#008855]"
                            >
                              Review
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
        </section>

        {/* Two Column Grid: Recent Payments & New Users */}
        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Recent Payments */}
          <Card>
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

          {/* New Users This Week */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>New Users This Week</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <UserIcon className="h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No new users this week
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
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
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
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
