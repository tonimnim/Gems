'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { GemCard, CategoryFilter } from '@/components/gems';
import { AFRICAN_COUNTRIES } from '@/constants';
import type { Gem, GemCategory } from '@/types';

// Mock data for now - will be replaced with Supabase queries
const mockGems: Gem[] = [
  {
    id: '1',
    owner_id: '1',
    name: 'The Secret Garden Restaurant',
    slug: 'secret-garden-restaurant',
    description: 'A hidden culinary paradise nestled in the heart of Nairobi',
    category: 'eat_drink',
    country: 'KE',
    city: 'Nairobi',
    address: '123 Garden Lane',
    status: 'approved',
    tier: 'featured',
    views_count: 1250,
    average_rating: 4.8,
    ratings_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: '1',
        gem_id: '1',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        type: 'image',
        is_cover: true,
        order: 0,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '2',
    owner_id: '2',
    name: 'Ol Pejeta Bush Camp',
    slug: 'ol-pejeta-bush-camp',
    description: 'Experience wildlife like never before in this intimate camp',
    category: 'stay',
    country: 'KE',
    city: 'Nanyuki',
    address: 'Ol Pejeta Conservancy',
    status: 'approved',
    tier: 'standard',
    views_count: 890,
    average_rating: 4.9,
    ratings_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: '2',
        gem_id: '2',
        url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800',
        type: 'image',
        is_cover: true,
        order: 0,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '3',
    owner_id: '3',
    name: 'Hell\'s Gate National Park Viewpoint',
    slug: 'hells-gate-viewpoint',
    description: 'Breathtaking views of the Rift Valley you won\'t find in guidebooks',
    category: 'nature',
    country: 'KE',
    city: 'Naivasha',
    address: "Hell's Gate National Park",
    status: 'approved',
    tier: 'featured',
    views_count: 2100,
    average_rating: 4.7,
    ratings_count: 234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: '3',
        gem_id: '3',
        url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
        type: 'image',
        is_cover: true,
        order: 0,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '4',
    owner_id: '4',
    name: 'The Jazz Lounge',
    slug: 'jazz-lounge-lagos',
    description: 'Lagos best kept secret for live jazz and soul music',
    category: 'entertainment',
    country: 'NG',
    city: 'Lagos',
    address: 'Victoria Island',
    status: 'approved',
    tier: 'standard',
    views_count: 567,
    average_rating: 4.5,
    ratings_count: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: '4',
        gem_id: '4',
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        type: 'image',
        is_cover: true,
        order: 0,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '5',
    owner_id: '5',
    name: 'Cape Point Hiking Trail',
    slug: 'cape-point-hiking',
    description: 'A secret trail with panoramic ocean views',
    category: 'adventure',
    country: 'ZA',
    city: 'Cape Town',
    address: 'Cape Point Nature Reserve',
    status: 'approved',
    tier: 'standard',
    views_count: 1890,
    average_rating: 4.9,
    ratings_count: 312,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: '5',
        gem_id: '5',
        url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
        type: 'image',
        is_cover: true,
        order: 0,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '6',
    owner_id: '6',
    name: 'Lamu Old Town Heritage Walk',
    slug: 'lamu-heritage-walk',
    description: 'Explore centuries-old Swahili architecture and culture',
    category: 'culture',
    country: 'KE',
    city: 'Lamu',
    address: 'Lamu Old Town',
    status: 'approved',
    tier: 'featured',
    views_count: 756,
    average_rating: 4.8,
    ratings_count: 145,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      {
        id: '6',
        gem_id: '6',
        url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
        type: 'image',
        is_cover: true,
        order: 0,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const [gems, setGems] = useState<Gem[]>(mockGems);
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(
    (searchParams.get('category') as GemCategory) || null
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(
    searchParams.get('country') || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter gems based on selections
  useEffect(() => {
    let filtered = mockGems;

    if (selectedCategory) {
      filtered = filtered.filter((gem) => gem.category === selectedCategory);
    }

    if (selectedCountry) {
      filtered = filtered.filter((gem) => gem.country === selectedCountry);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (gem) =>
          gem.name.toLowerCase().includes(query) ||
          gem.description.toLowerCase().includes(query) ||
          gem.city.toLowerCase().includes(query)
      );
    }

    setGems(filtered);
  }, [selectedCategory, selectedCountry, searchQuery]);

  const handleFavoriteToggle = (gemId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(gemId)) {
        newFavorites.delete(gemId);
      } else {
        newFavorites.add(gemId);
      }
      return newFavorites;
    });
  };

  const countryOptions = [
    { value: '', label: 'All Countries' },
    ...AFRICAN_COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Explore Gems
          </h1>
          <p className="mt-2 text-gray-600">
            Discover amazing hidden places across Africa
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#34E0A1] focus:border-transparent"
              />
            </div>
            <button className="hidden md:flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Country filter */}
          <div className="flex gap-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#34E0A1] focus:border-transparent bg-white"
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Results */}
        {gems.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {gems.length} {gems.length === 1 ? 'gem' : 'gems'} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gems.map((gem) => (
                <GemCard
                  key={gem.id}
                  gem={gem}
                  isFavorite={favorites.has(gem.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 mb-4">
              No gems found matching your criteria
            </p>
            <button
              className="px-6 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedCountry('');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
