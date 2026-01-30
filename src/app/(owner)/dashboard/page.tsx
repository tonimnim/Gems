'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Eye, Star, MessageSquare, Plus, AlertCircle, UtensilsCrossed, TrendingUp, Loader2, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/context/auth-context';
import { ROUTES, PRICING, FREE_TRIAL } from '@/constants';
import { formatCurrency, daysUntilExpiry } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Gem as GemType } from '@/types';

const chartConfig = {
  views: {
    label: 'Views',
    color: '#00AA6C',
  },
} satisfies ChartConfig;

// Cache for dashboard data (5 minute TTL)
const CACHE_TTL = 5 * 60 * 1000;
let dashboardCache: {
  gem: GemType | null;
  stats: { totalViews: number; totalRatings: number; averageRating: number };
  viewsData: { day: string; views: number }[];
  timestamp: number;
} | null = null;

export default function DashboardPage() {
  const { user } = useAuth();
  const [gem, setGem] = useState<GemType | null>(null);
  const [stats, setStats] = useState({ totalViews: 0, totalRatings: 0, averageRating: 0 });
  const [viewsData, setViewsData] = useState<{ day: string; views: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchDashboardData = async () => {
      // Check cache first
      if (dashboardCache && Date.now() - dashboardCache.timestamp < CACHE_TTL) {
        setGem(dashboardCache.gem);
        setStats(dashboardCache.stats);
        setViewsData(dashboardCache.viewsData);
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Fetch owner's gem (just one)
        const { data: gemData } = await supabase
          .from('gems')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)
          .single();

        if (gemData) {
          setGem(gemData);

          // Calculate stats from gem data
          const gemStats = {
            totalViews: gemData.views_count || 0,
            totalRatings: gemData.ratings_count || 0,
            averageRating: gemData.average_rating || 0,
          };
          setStats(gemStats);

          // Generate views data for the chart (last 7 days from page_views)
          const { data: viewsRaw } = await supabase.rpc('get_daily_traffic', { days_back: 7 });

          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const chartData = (viewsRaw || []).map((item: { day: string; views: number }) => ({
            day: days[new Date(item.day).getDay()],
            views: Number(item.views),
          }));
          setViewsData(chartData);

          // Update cache
          dashboardCache = {
            gem: gemData,
            stats: gemStats,
            viewsData: chartData,
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const getStatusBadge = (status: GemType['status']) => {
    const styles: Record<GemType['status'], string> = {
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  // Calculate total views this week
  const weeklyViews = viewsData.reduce((sum, d) => sum + d.views, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#092327]">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Owner'}
          </h1>
          <p className="text-gray-500">
            Manage your gems and track their performance
          </p>
        </div>
        {!isLoading && !gem && (
          <Link href={ROUTES.newGem}>
            <Button className="bg-[#00AA6C] hover:bg-[#008855]">
              <Plus className="h-4 w-4 mr-2" />
              Add New Gem
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Row - Graph + 2 Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Views Graph - spans 2 columns and 2 rows */}
        <Card className="border-0 bg-white shadow-sm lg:col-span-2 lg:row-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Views This Week</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-semibold text-[#092327]">
                    {weeklyViews.toLocaleString()}
                  </h3>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00AA6C]/10">
                <Eye className="h-5 w-5 text-[#00AA6C]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <AreaChart
                data={viewsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AA6C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00AA6C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  width={40}
                />
                <ChartTooltip
                  cursor={{ stroke: '#00AA6C', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#00AA6C"
                  strokeWidth={2}
                  fill="url(#fillViews)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Avg Rating */}
        <StatsCard
          title="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          variant="warning"
        />

        {/* Total Reviews */}
        <StatsCard
          title="Total Reviews"
          value={stats.totalRatings}
          icon={MessageSquare}
        />

        {/* Listing Info - spans 2 columns */}
        <Card className="border-0 bg-white shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            {FREE_TRIAL.enabled && gem?.current_term_end ? (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#092327]">Free Trial</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    Active
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#00AA6C]">
                      {Math.max(0, daysUntilExpiry(gem.current_term_end))}
                    </span>
                    <span className="text-gray-500">days remaining</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Your listing is free during the trial period. Enjoy!
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-[#092327]">Listing Pricing</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Standard</span>
                    <span className="font-medium">{formatCurrency(PRICING.standard.per_term)}/term</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Featured</span>
                    <span className="font-medium">{formatCurrency(PRICING.featured.per_term)}/term</span>
                  </div>
                  <p className="text-xs text-gray-400 pt-1">1 term = 6 months</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Gem */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>My Gem</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !gem ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Eye className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">No gems yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first gem</p>
              <Link href={ROUTES.newGem} className="mt-4">
                <Button size="sm" className="bg-[#00AA6C] hover:bg-[#008855]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Gem
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {(() => {
                const daysLeft = gem.current_term_end ? daysUntilExpiry(gem.current_term_end) : null;
                const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                const isExpired = daysLeft !== null && daysLeft <= 0;
                // During free trial, don't require payment
                const needsPayment = !FREE_TRIAL.enabled && gem.status === 'approved' && (!gem.current_term_end || isExpired);
                const isLive = gem.status === 'approved' && gem.current_term_end && !isExpired;
                const isFreeTrial = FREE_TRIAL.enabled && isLive;

                return (
                  <div>
                    {/* Payment Required Banner */}
                    {needsPayment && (
                      <div className="bg-amber-50 border-b border-amber-100 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                              <CreditCard className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-amber-800">Payment Required</h4>
                              <p className="text-sm text-amber-700">
                                {isExpired
                                  ? 'Your listing has expired. Renew to make it visible again.'
                                  : 'Your gem is approved! Complete payment to make it visible to the public.'}
                              </p>
                            </div>
                          </div>
                          <Link href={`/gems/${gem.id}/pay`}>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
                              <CreditCard className="h-4 w-4 mr-2" />
                              {isExpired ? 'Renew Now' : 'Pay to Go Live'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Gem Details Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-[#092327] truncate">{gem.name}</h3>
                          {needsPayment ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border-amber-200">
                              {isExpired ? 'expired' : 'awaiting payment'}
                            </span>
                          ) : (
                            getStatusBadge(gem.status)
                          )}
                          {isLive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                              Live
                            </span>
                          )}
                          {isFreeTrial && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              Free Trial
                            </span>
                          )}
                          {gem.tier === 'featured' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00AA6C]/10 text-[#00AA6C]">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {gem.city}, {gem.country}
                        </p>
                        {isExpiringSoon && isLive && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3" />
                            {isFreeTrial ? (
                              <span>Free trial ends in {daysLeft} days</span>
                            ) : (
                              <span>Expires in {daysLeft} days - <Link href={`/gems/${gem.id}/pay`} className="underline">Renew now</Link></span>
                            )}
                          </div>
                        )}
                        {gem.status === 'pending' && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3" />
                            <span>Waiting for admin review</span>
                          </div>
                        )}
                        {gem.status === 'rejected' && gem.rejection_reason && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>Rejected: {gem.rejection_reason}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Eye className="h-4 w-4" />
                          <span>{gem.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Star className="h-4 w-4" />
                          <span>{gem.average_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        {gem.category === 'eat_drink' && (
                          <Link href={ROUTES.gemMenu(gem.id)}>
                            <Button variant="ghost" size="sm" className="text-gray-600">
                              <UtensilsCrossed className="h-4 w-4 mr-1" />
                              Menu
                            </Button>
                          </Link>
                        )}
                        <Link href={ROUTES.editGem(gem.id)}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
