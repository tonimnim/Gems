// User types
export type UserRole = 'visitor' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  country?: string;
  created_at: string;
  updated_at: string;
}

// Gem types
export type GemStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type GemTier = 'standard' | 'featured';

export type GemCategory =
  | 'eat_drink'
  | 'nature'
  | 'stay'
  | 'culture'
  | 'adventure'
  | 'entertainment';

export interface GemMedia {
  id: string;
  gem_id: string;
  url: string;
  type: 'image' | 'video';
  is_cover: boolean;
  order: number;
  created_at: string;
}

export interface Gem {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  category: GemCategory;
  country: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: string;
  price_range?: string;
  status: GemStatus;
  tier: GemTier;
  rejection_reason?: string;
  views_count: number;
  average_rating: number;
  ratings_count: number;
  current_term_start?: string;
  current_term_end?: string;
  created_at: string;
  updated_at: string;
  // Relations
  media?: GemMedia[];
  owner?: User;
}

// Rating types
export interface Rating {
  id: string;
  gem_id: string;
  user_id: string;
  score: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
}

// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'new_listing' | 'renewal' | 'upgrade';

export interface Payment {
  id: string;
  gem_id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  provider: string; // 'paystack', 'mpesa', etc.
  provider_reference?: string;
  term_start: string;
  term_end: string;
  created_at: string;
  updated_at: string;
}

// Favorite types
export interface Favorite {
  id: string;
  user_id: string;
  gem_id: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Filter types
export interface GemFilters {
  category?: GemCategory;
  country?: string;
  city?: string;
  min_rating?: number;
  tier?: GemTier;
  search?: string;
}
