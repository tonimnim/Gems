import { GemCategory } from '@/types';

export const APP_NAME = 'Hidden Gems';
export const APP_DESCRIPTION = 'Discover amazing hidden gems across Africa';

// Pricing in KES
export const PRICING = {
  standard: {
    per_term: 500,
    per_year: 1000,
  },
  featured: {
    per_term: 750,
    per_year: 1500,
  },
  term_months: 6,
} as const;

export const GEM_CATEGORIES: Record<
  GemCategory,
  { label: string; icon: string; description: string }
> = {
  eat_drink: {
    label: 'Eat & Drink',
    icon: 'UtensilsCrossed',
    description: 'Hidden restaurants, rooftop bars, themed cafes',
  },
  nature: {
    label: 'Nature & Outdoors',
    icon: 'Trees',
    description: 'Gardens, waterfalls, scenic viewpoints, hidden beaches',
  },
  stay: {
    label: 'Stay',
    icon: 'Bed',
    description: 'Boutique lodges, unique Airbnbs, treehouses',
  },
  culture: {
    label: 'Culture & History',
    icon: 'Landmark',
    description: 'Castles, museums, cultural villages, art galleries',
  },
  adventure: {
    label: 'Adventure',
    icon: 'Mountain',
    description: 'Zip-lining spots, hiking trails, kayaking points',
  },
  entertainment: {
    label: 'Entertainment',
    icon: 'Music',
    description: 'Live music spots, comedy clubs, outdoor cinemas',
  },
};

// African countries with their currencies and payment methods
export const AFRICAN_COUNTRIES = [
  { code: 'KE', name: 'Kenya', currency: 'KES', paymentMethods: ['mpesa', 'card'] },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', paymentMethods: ['card', 'bank'] },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', paymentMethods: ['card', 'bank'] },
  { code: 'GH', name: 'Ghana', currency: 'GHS', paymentMethods: ['momo', 'card'] },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', paymentMethods: ['mpesa', 'card'] },
  { code: 'UG', name: 'Uganda', currency: 'UGX', paymentMethods: ['momo', 'card'] },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', paymentMethods: ['momo', 'card'] },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', paymentMethods: ['card', 'bank'] },
  { code: 'EG', name: 'Egypt', currency: 'EGP', paymentMethods: ['card', 'bank'] },
  { code: 'MA', name: 'Morocco', currency: 'MAD', paymentMethods: ['card', 'bank'] },
  { code: 'SN', name: 'Senegal', currency: 'XOF', paymentMethods: ['card', 'momo'] },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', paymentMethods: ['card', 'momo'] },
  { code: 'CM', name: 'Cameroon', currency: 'XAF', paymentMethods: ['card', 'momo'] },
  { code: 'ZM', name: 'Zambia', currency: 'ZMW', paymentMethods: ['card', 'momo'] },
  { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL', paymentMethods: ['card', 'ecocash'] },
  { code: 'BW', name: 'Botswana', currency: 'BWP', paymentMethods: ['card', 'bank'] },
  { code: 'MW', name: 'Malawi', currency: 'MWK', paymentMethods: ['card', 'momo'] },
  { code: 'MZ', name: 'Mozambique', currency: 'MZN', paymentMethods: ['card', 'mpesa'] },
  { code: 'NA', name: 'Namibia', currency: 'NAD', paymentMethods: ['card', 'bank'] },
  { code: 'MU', name: 'Mauritius', currency: 'MUR', paymentMethods: ['card', 'bank'] },
] as const;

export const ROUTES = {
  home: '/',
  explore: '/explore',
  search: '/search',
  favorites: '/favorites',
  gem: (id: string) => `/gem/${id}`,
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  // Owner
  dashboard: '/dashboard',
  newGem: '/gems/new',
  editGem: (id: string) => `/gems/${id}/edit`,
  payments: '/payments',
  // Admin
  verify: '/verify',
  analytics: '/analytics',
} as const;

export const API_ROUTES = {
  // Auth
  signUp: '/api/auth/sign-up',
  signIn: '/api/auth/sign-in',
  signOut: '/api/auth/sign-out',
  // Gems
  gems: '/api/gems',
  gem: (id: string) => `/api/gems/${id}`,
  myGems: '/api/gems/mine',
  pendingGems: '/api/gems/pending',
  // Ratings
  ratings: (gemId: string) => `/api/ratings/${gemId}`,
  // Payments
  initPayment: '/api/payments/init',
  verifyPayment: '/api/payments/verify',
  // Upload
  upload: '/api/upload',
} as const;
