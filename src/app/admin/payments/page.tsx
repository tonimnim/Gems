'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PageHeader,
  StatsCard,
  StatsCardSkeleton,
  PaymentStatusIcon,
} from '@/components/admin';
import { formatCurrency } from '@/lib/utils';
import type {
  PaymentFilters,
  PaymentWithDetails,
  PaymentStats,
  PaginatedPayments,
} from '@/lib/api/admin';
import type { PaymentType, PaymentStatus } from '@/types';

// Helper to format date/time
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Payment type badge component
function PaymentTypeBadge({ type }: { type: PaymentType }) {
  const typeConfig: Record<
    PaymentType,
    { label: string; className: string }
  > = {
    new_listing: {
      label: 'New Listing',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    renewal: {
      label: 'Renewal',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    upgrade: {
      label: 'Upgrade',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  };

  const config = typeConfig[type] || typeConfig.new_listing;

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

// Provider badge component
function ProviderBadge({ provider }: { provider: string }) {
  const providerConfig: Record<
    string,
    { label: string; className: string }
  > = {
    mpesa: {
      label: 'M-Pesa',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    paystack: {
      label: 'Paystack',
      className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
  };

  const config = providerConfig[provider.toLowerCase()] || {
    label: provider,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

// Stats cards loading skeleton
function StatsCardsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table loading skeleton
function TableLoading() {
  return (
    <Card>
      <CardHeader className="border-b">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              {Array.from({ length: 8 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 8 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <CreditCard className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-base font-medium text-gray-900">
        No payments found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your filters or search terms.
      </p>
    </div>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}

export default function PaymentsPage() {
  // State
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    dateRange: 'all',
    provider: 'all',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/payments/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(
    async (page: number = 1) => {
      setIsLoadingPayments(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '10');
        if (filters.status && filters.status !== 'all') {
          params.set('status', filters.status);
        }
        if (filters.dateRange && filters.dateRange !== 'all') {
          params.set('dateRange', filters.dateRange);
        }
        if (filters.provider && filters.provider !== 'all') {
          params.set('provider', filters.provider);
        }
        if (filters.search) {
          params.set('search', filters.search);
        }

        const response = await fetch(`/api/admin/payments?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data: PaginatedPayments = await response.json();
        setPayments(data.payments);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
      } finally {
        setIsLoadingPayments(false);
      }
    },
    [filters]
  );

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPayments(1);
  }, [filters.status, filters.dateRange, filters.provider, fetchPayments]);

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value as PaymentFilters['status'],
    }));
  };

  const handleDateRangeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: value as PaymentFilters['dateRange'],
    }));
  };

  const handleProviderChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      provider: value as PaymentFilters['provider'],
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchPayments(page);
  };

  // Handle export
  const handleExport = () => {
    // Generate CSV data
    const headers = [
      'Status',
      'Gem Name',
      'Owner',
      'Amount',
      'Provider',
      'Receipt',
      'Type',
      'Date',
    ];
    const rows = payments.map((payment) => [
      payment.status,
      payment.gem?.name || 'Unknown',
      payment.user?.full_name || 'Unknown',
      `${payment.currency} ${payment.amount}`,
      payment.provider,
      payment.provider_reference || '-',
      payment.type,
      new Date(payment.created_at).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );

    // Download the file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payments"
        description={
          stats
            ? `Total revenue: ${formatCurrency(stats.totalRevenue)}`
            : 'Loading...'
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={payments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Stats Cards */}
      {isLoadingStats ? (
        <StatsCardsLoading />
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            variant="default"
            description="All time earnings"
          />
          <StatsCard
            title="This Month"
            value={formatCurrency(stats.revenueThisMonth)}
            icon={TrendingUp}
            variant="success"
            description="Current month revenue"
          />
          <StatsCard
            title="Successful Payments"
            value={stats.successfulCount.toLocaleString()}
            icon={CheckCircle2}
            variant="success"
            description="Completed transactions"
          />
          <StatsCard
            title="Failed Payments"
            value={stats.failedCount.toLocaleString()}
            icon={XCircle}
            variant="danger"
            description="Failed transactions"
          />
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Status Filter */}
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select
              value={filters.dateRange}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>

            {/* Provider Filter */}
            <Select
              value={filters.provider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by receipt number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} size="sm">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      {isLoadingPayments ? (
        <TableLoading />
      ) : payments.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Payments ({pagination.total.toLocaleString()})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-[40px]">Status</TableHead>
                  <TableHead>Gem Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date/Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <TableCell>
                      <PaymentStatusIcon status={payment.status as PaymentStatus} />
                    </TableCell>
                    <TableCell>
                      {payment.gem ? (
                        <Link
                          href={`/gem/${payment.gem.slug || payment.gem.id}`}
                          className="font-medium text-[#00AA6C] hover:underline"
                        >
                          {payment.gem.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {payment.user?.full_name || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <ProviderBadge provider={payment.provider} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-500">
                        {payment.provider_reference || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentTypeBadge type={payment.type as PaymentType} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
