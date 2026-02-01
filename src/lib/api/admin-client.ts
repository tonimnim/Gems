/**
 * Client-side admin API functions
 * These use the browser Supabase client and can be used in client components
 */

import { createClient } from '@/lib/supabase/client';
import type { Gem, GemStatus, GemCategory, Payment, PaginatedResponse } from '@/types';

// Types for admin dashboard data
export interface AdminStats {
  totalGems: number;
  pendingReview: number;
  activeGems: number;
  revenueThisMonth: number;
}

export interface AdminGemFilters {
  status?: GemStatus | 'all';
  category?: GemCategory | 'all';
  country?: string;
  search?: string;
}

// Payment types for admin pages
export interface PaymentWithDetails extends Payment {
  gem: { id: string; name: string; slug: string } | null;
  user: { id: string; full_name: string; email: string } | null;
}

export interface PaymentStats {
  totalRevenue: number;
  revenueThisMonth: number;
  successfulCount: number;
  failedCount: number;
}

export interface PaginatedPayments {
  payments: PaymentWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User types for admin pages
export interface UserWithGemsCount {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'visitor' | 'owner' | 'admin';
  country?: string;
  created_at: string;
  updated_at: string;
  gems_count: number;
}

export interface UserPaymentWithGem extends Payment {
  gem?: { id: string; name: string; slug: string } | null;
}

export interface UserWithDetails extends UserWithGemsCount {
  gems?: Gem[];
  payments?: UserPaymentWithGem[];
}

// Get admin dashboard statistics
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient();

  const [totalResult, pendingResult, activeResult, paymentsResult] = await Promise.all([
    supabase.from('gems').select('*', { count: 'exact', head: true }),
    supabase.from('gems').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('gems').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('payments').select('amount').eq('status', 'completed'),
  ]);

  const revenueThisMonth = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return {
    totalGems: totalResult.count || 0,
    pendingReview: pendingResult.count || 0,
    activeGems: activeResult.count || 0,
    revenueThisMonth,
  };
}

// Get pending gems for verification
export async function getPendingGems(limit: number = 5) {
  const supabase = createClient();

  const { data: gems, error } = await supabase
    .from('gems')
    .select(`*, media:gem_media(url, is_cover)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching pending gems:', error);
    return [];
  }

  return gems || [];
}

// Get recent payments
export async function getRecentPayments(limit: number = 5) {
  const supabase = createClient();

  const { data: payments, error } = await supabase
    .from('payments')
    .select(`*, gem:gems(name)`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent payments:', error);
    return [];
  }

  return payments || [];
}

// Get recent users
export async function getRecentUsers(limit: number = 5) {
  const supabase = createClient();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent users:', error);
    return [];
  }

  return users || [];
}

// Get gems with filtering and pagination
export async function getGems(
  filters: AdminGemFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Gem>> {
  const supabase = createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('gems')
    .select('*, media:gem_media(*), owner:profiles(*)', { count: 'exact' });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.country && filters.country !== 'all') {
    query = query.eq('country', filters.country);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching gems:', error);
    return { data: [], total: 0, page, limit, total_pages: 0 };
  }

  const total = count || 0;
  return {
    data: data || [],
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}

// Get a single gem by ID
export async function getGemById(id: string): Promise<Gem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('gems')
    .select('*, media:gem_media(*), owner:profiles(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching gem:', error);
    return null;
  }

  return data;
}

// Update gem status
export async function updateGemStatus(
  id: string,
  status: GemStatus,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'rejected' && rejectionReason) {
    updateData.rejection_reason = rejectionReason;
  } else if (status === 'approved') {
    updateData.rejection_reason = null;
  }

  const { error } = await supabase.from('gems').update(updateData).eq('id', id);

  if (error) {
    console.error('Error updating gem status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update gem details
export async function updateGem(
  id: string,
  data: Partial<Omit<Gem, 'id' | 'created_at' | 'owner_id'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('gems')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating gem:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete a gem (admin only - uses secure database function)
export async function deleteGem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Use secure RPC function that bypasses RLS for admins
  const { data, error } = await supabase.rpc('admin_delete_gem', {
    gem_id: id,
    user_id: user.id,
  });

  if (error) {
    console.error('Error deleting gem:', error);
    return { success: false, error: error.message };
  }

  // The function returns { success: boolean, error?: string }
  if (data && typeof data === 'object' && 'success' in data) {
    return data as { success: boolean; error?: string };
  }

  return { success: true };
}

// Get unique countries from gems
export async function getUniqueCountries(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from('gems').select('country');

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  const uniqueCountries = [...new Set(data?.map((g) => g.country).filter(Boolean))];
  return uniqueCountries.sort();
}

// Get gem counts by status
export async function getGemCounts(): Promise<Record<GemStatus | 'all', number>> {
  const supabase = createClient();

  const { data, error } = await supabase.from('gems').select('status');

  if (error) {
    console.error('Error fetching gem counts:', error);
    return { all: 0, pending: 0, approved: 0, rejected: 0, expired: 0 };
  }

  const counts: Record<GemStatus | 'all', number> = {
    all: data?.length || 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  };

  data?.forEach((gem) => {
    if (gem.status in counts) {
      counts[gem.status as GemStatus]++;
    }
  });

  return counts;
}

// ========== User Management Functions ==========

export interface UserFilters {
  role?: 'owner' | 'admin' | 'all';
  country?: string;
  search?: string;
}

export async function getUsers(
  filters: UserFilters = {},
  page: number = 1,
  limit: number = 10
) {
  const supabase = createClient();
  const offset = (page - 1) * limit;

  let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
  let dataQuery = supabase.from('profiles').select('*');

  if (filters.role && filters.role !== 'all') {
    countQuery = countQuery.eq('role', filters.role);
    dataQuery = dataQuery.eq('role', filters.role);
  }

  if (filters.country) {
    countQuery = countQuery.eq('country', filters.country);
    dataQuery = dataQuery.eq('country', filters.country);
  }

  if (filters.search) {
    const searchFilter = `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`;
    countQuery = countQuery.or(searchFilter);
    dataQuery = dataQuery.or(searchFilter);
  }

  dataQuery = dataQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  if (dataResult.error) {
    throw new Error(dataResult.error.message);
  }

  const users = dataResult.data || [];
  const total = countResult.count || 0;

  // Get gems count for each user
  const userIds = users.map((u) => u.id);
  let gemsCountMap: Record<string, number> = {};

  if (userIds.length > 0) {
    const { data: gemsCounts } = await supabase
      .from('gems')
      .select('owner_id')
      .in('owner_id', userIds);

    if (gemsCounts) {
      gemsCountMap = gemsCounts.reduce((acc, gem) => {
        acc[gem.owner_id] = (acc[gem.owner_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  const usersWithCount = users.map((user) => ({
    ...user,
    gems_count: gemsCountMap[user.id] || 0,
  }));

  return {
    data: usersWithCount,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}

export async function updateUserRole(
  userId: string,
  role: 'owner' | 'admin' | 'visitor'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserCountries(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('country')
    .not('country', 'is', null);

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  const countries = [...new Set(data?.map((u) => u.country).filter(Boolean))] as string[];
  return countries.sort();
}

export async function getTotalUsersCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching users count:', error);
    return 0;
  }

  return count || 0;
}

// ========== Payment Functions ==========

export interface PaymentFilters {
  status?: 'all' | 'completed' | 'pending' | 'failed' | 'refunded';
  dateRange?: 'week' | 'month' | '3months' | 'all';
  provider?: 'all' | 'mpesa' | 'paystack';
  search?: string;
}

export async function getPaymentStats() {
  const supabase = createClient();

  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRevenue = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString());

  const revenueThisMonth = monthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const { count: successfulCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const { count: failedCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  return {
    totalRevenue,
    revenueThisMonth,
    successfulCount: successfulCount || 0,
    failedCount: failedCount || 0,
  };
}

export async function getPayments(
  filters: PaymentFilters = {},
  page: number = 1,
  limit: number = 10
) {
  const supabase = createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('payments')
    .select(`*, gem:gems(id, name, slug), user:profiles(id, full_name, email)`, { count: 'exact' });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (filters.dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        startDate = new Date(0);
    }

    query = query.gte('created_at', startDate.toISOString());
  }

  if (filters.provider && filters.provider !== 'all') {
    query = query.eq('provider', filters.provider);
  }

  if (filters.search) {
    query = query.ilike('provider_reference', `%${filters.search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: payments, error, count } = await query;

  if (error) {
    console.error('Error fetching payments:', error);
    return { payments: [], total: 0, page, limit, totalPages: 0 };
  }

  const total = count || 0;

  return {
    payments: payments || [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
