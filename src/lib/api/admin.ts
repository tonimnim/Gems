import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import type { Gem, GemStatus, GemCategory, Payment, User, PaginatedResponse } from '@/types';

// Types for admin dashboard data
export interface AdminStats {
  totalGems: number;
  pendingReview: number;
  activeGems: number;
  revenueThisMonth: number;
}

export interface PendingGemMedia {
  url: string;
  is_cover: boolean;
}

export interface PendingGem {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  country: string;
  city: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
  media?: PendingGemMedia[];
}

export interface RecentPayment extends Payment {
  gem?: { name: string };
}

export interface RecentUser extends User {
  created_at: string;
}

// Get admin dashboard statistics
export const getAdminStats = unstable_cache(
  async (): Promise<AdminStats> => {
    const supabase = await createClient();

    // Get total gems count
    const { count: totalGems } = await supabase
      .from('gems')
      .select('*', { count: 'exact', head: true });

    // Get pending review count
    const { count: pendingReview } = await supabase
      .from('gems')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get active gems count (approved and not expired)
    const { count: activeGems } = await supabase
      .from('gems')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Get revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const revenueThisMonth = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      totalGems: totalGems || 0,
      pendingReview: pendingReview || 0,
      activeGems: activeGems || 0,
      revenueThisMonth,
    };
  },
  ['admin-stats'],
  { revalidate: 60, tags: ['admin-stats'] }
);

// Get pending gems for verification
export const getPendingGems = unstable_cache(
  async (limit: number = 5): Promise<PendingGem[]> => {
    const supabase = await createClient();

    const { data: gems, error } = await supabase
      .from('gems')
      .select(`
        *,
        media:gem_media(url, is_cover)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching pending gems:', error);
      return [];
    }

    return gems || [];
  },
  ['pending-gems'],
  { revalidate: 30, tags: ['pending-gems'] }
);

// Get recent payments
export const getRecentPayments = unstable_cache(
  async (limit: number = 5): Promise<RecentPayment[]> => {
    const supabase = await createClient();

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        gem:gems(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent payments:', error);
      return [];
    }

    return payments || [];
  },
  ['recent-payments'],
  { revalidate: 60, tags: ['recent-payments'] }
);

// Get recent users
export const getRecentUsers = unstable_cache(
  async (limit: number = 5): Promise<RecentUser[]> => {
    const supabase = await createClient();

    // Get users from the last week
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
  },
  ['recent-users'],
  { revalidate: 60, tags: ['recent-users'] }
);

// Types for gem filtering
export interface AdminGemFilters {
  status?: GemStatus | 'all';
  category?: GemCategory | 'all';
  country?: string;
  search?: string;
}

// Get gems with filtering and pagination
export async function getGems(
  filters: AdminGemFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Gem>> {
  const supabase = await createClient();

  // Calculate offset
  const offset = (page - 1) * limit;

  // Build the query
  let query = supabase
    .from('gems')
    .select('*, media:gem_media(*), owner:profiles(*)', { count: 'exact' });

  // Apply filters
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

  // Apply ordering and pagination
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching gems:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      total_pages: 0,
    };
  }

  const total = count || 0;
  const total_pages = Math.ceil(total / limit);

  return {
    data: data || [],
    total,
    page,
    limit,
    total_pages,
  };
}

// Get a single gem by ID
export async function getGemById(id: string): Promise<Gem | null> {
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  data: Partial<Gem>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('gems')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating gem:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete a gem
export async function deleteGem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // First delete related media
  const { error: mediaError } = await supabase.from('gem_media').delete().eq('gem_id', id);

  if (mediaError) {
    console.error('Error deleting gem media:', mediaError);
    // Continue anyway, media might not exist
  }

  // Delete related ratings
  const { error: ratingsError } = await supabase.from('ratings').delete().eq('gem_id', id);

  if (ratingsError) {
    console.error('Error deleting gem ratings:', ratingsError);
    // Continue anyway
  }

  // Delete related favorites
  const { error: favoritesError } = await supabase.from('favorites').delete().eq('gem_id', id);

  if (favoritesError) {
    console.error('Error deleting gem favorites:', favoritesError);
    // Continue anyway
  }

  // Then delete the gem
  const { error } = await supabase.from('gems').delete().eq('id', id);

  if (error) {
    console.error('Error deleting gem:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Get gem counts by status
export async function getGemCounts(): Promise<Record<GemStatus | 'all', number>> {
  const supabase = await createClient();

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

// Get unique countries from gems
export async function getUniqueCountries(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('gems').select('country');

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  const uniqueCountries = [...new Set(data?.map((g) => g.country).filter(Boolean))];
  return uniqueCountries.sort();
}

// ========== User Management Functions ==========

export interface UserWithGemsCount extends User {
  gems_count: number;
}

export interface UserFilters {
  role?: 'owner' | 'admin' | 'all';
  country?: string;
  search?: string;
}

export interface UserWithDetails extends User {
  gems_count: number;
  gems: Gem[];
  payments: (Payment & { gem?: { name: string } })[];
}

/**
 * Get paginated list of users with gem counts
 */
export async function getUsers(
  filters: UserFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<UserWithGemsCount>> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  // Build the query - we need to use a different approach for counting
  let countQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  let dataQuery = supabase
    .from('profiles')
    .select('*');

  // Apply filters to both queries
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

  // Apply pagination to data query
  dataQuery = dataQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Execute both queries
  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

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

  // Transform the data to include gems_count
  const usersWithCount: UserWithGemsCount[] = users.map((user) => ({
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

/**
 * Get a single user by ID with their gems and payments
 */
export async function getUserById(id: string): Promise<UserWithDetails | null> {
  const supabase = await createClient();

  // Get user profile
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (userError || !user) {
    return null;
  }

  // Get user's gems
  const { data: gems, error: gemsError } = await supabase
    .from('gems')
    .select('*, media:gem_media(*)')
    .eq('owner_id', id)
    .order('created_at', { ascending: false });

  if (gemsError) {
    console.error('Error fetching user gems:', gemsError);
  }

  // Get user's payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*, gem:gems(name)')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  if (paymentsError) {
    console.error('Error fetching user payments:', paymentsError);
  }

  return {
    ...user,
    gems_count: gems?.length || 0,
    gems: gems || [],
    payments: payments || [],
  };
}

/**
 * Update a user's role
 */
export async function updateUserRole(
  userId: string,
  role: 'owner' | 'admin' | 'visitor'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all unique countries from users
 */
export async function getUserCountries(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('country')
    .not('country', 'is', null);

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  // Extract unique countries
  const countries = [...new Set(data?.map((u) => u.country).filter(Boolean))] as string[];
  return countries.sort();
}

/**
 * Get total users count
 */
export async function getTotalUsersCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching users count:', error);
    return 0;
  }

  return count || 0;
}

// ========== Payment Management Functions ==========

export interface PaymentFilters {
  status?: 'all' | 'completed' | 'pending' | 'failed' | 'refunded';
  dateRange?: 'week' | 'month' | '3months' | 'all';
  provider?: 'all' | 'mpesa' | 'paystack';
  search?: string;
}

export interface PaymentWithDetails extends Payment {
  gem?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
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

/**
 * Get payment statistics for dashboard cards
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  const supabase = await createClient();

  // Get total revenue (all time, completed only)
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRevenue = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Get revenue this month (completed only)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString());

  const revenueThisMonth = monthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Get successful payments count
  const { count: successfulCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  // Get failed payments count
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

/**
 * Get payments with filtering and pagination
 */
export async function getPayments(
  filters: PaymentFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPayments> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  // Build the query
  let query = supabase
    .from('payments')
    .select(`
      *,
      gem:gems(id, name, slug),
      user:profiles(id, full_name, email)
    `, { count: 'exact' });

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Apply date range filter
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

  // Apply provider filter
  if (filters.provider && filters.provider !== 'all') {
    query = query.eq('provider', filters.provider);
  }

  // Apply search filter (search by receipt/provider_reference)
  if (filters.search) {
    query = query.ilike('provider_reference', `%${filters.search}%`);
  }

  // Apply pagination and ordering
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: payments, error, count } = await query;

  if (error) {
    console.error('Error fetching payments:', error);
    return {
      payments: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    payments: (payments as unknown as PaymentWithDetails[]) || [],
    total,
    page,
    limit,
    totalPages,
  };
}
