// User types
export type UserRole = 'visitor' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url?: string | null;
  role: UserRole;
  country?: string | null;
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
  category: GemCategory; // Primary category (legacy, kept for backwards compatibility)
  categories: GemCategory[]; // Up to 3 categories
  country: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
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

// Notification types
export type NotificationType =
  | 'new_review'           // Owner: someone reviewed their gem
  | 'gem_approved'         // Owner: gem was approved
  | 'gem_rejected'         // Owner: gem was rejected
  | 'payment_success'      // Owner: payment successful
  | 'payment_failed'       // Owner: payment failed
  | 'listing_expiring'     // Owner: listing expiring soon
  | 'gem_saved'            // Owner: someone saved their gem
  | 'saved_gem_updated'    // Visitor: a saved gem was updated
  | 'new_gem_pending'      // Admin: new gem needs verification
  | 'new_payment';         // Admin: new payment received

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    gem_id?: string;
    gem_name?: string;
    payment_id?: string;
    review_id?: string;
    rating?: number;
  };
  read: boolean;
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

// Menu Item types (for eat_drink gems)
export interface MenuItem {
  id: string;
  gem_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string; // e.g., 'Starters', 'Main Course', 'Desserts', 'Drinks'
  image_url?: string; // Optional image
  is_available: boolean;
  is_featured: boolean; // Signature dishes
  order: number;
  created_at: string;
  updated_at: string;
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
