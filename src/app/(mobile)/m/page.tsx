'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Bell, Search } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import {
  GemCard,
  GemCardSkeleton,
  SectionHeader,
  CategoryPills,
  type GemCardData,
} from '@/components/mobile';
import type { GemCategory } from '@/types';

// Mock data - will be replaced with API calls
const mockGems: GemCardData[] = [
  {
    id: '1',
    name: 'Kazuri Beads Factory',
    category: 'culture',
    city: 'Karen',
    country: 'KE',
    average_rating: 4.8,
    ratings_count: 124,
    tier: 'featured',
    distance: '2.3 km',
  },
  {
    id: '2',
    name: 'Kitisuru Forest Trail',
    category: 'nature',
    city: 'Kitisuru',
    country: 'KE',
    average_rating: 4.6,
    ratings_count: 89,
    tier: 'standard',
    distance: '4.1 km',
  },
  {
    id: '3',
    name: 'Tin Roof Cafe',
    category: 'eat_drink',
    city: 'Westlands',
    country: 'KE',
    average_rating: 4.7,
    ratings_count: 256,
    tier: 'featured',
    distance: '1.8 km',
  },
  {
    id: '4',
    name: 'Giraffe Manor Gardens',
    category: 'nature',
    city: 'Langata',
    country: 'KE',
    average_rating: 4.9,
    ratings_count: 412,
    tier: 'featured',
    distance: '5.2 km',
  },
  {
    id: '5',
    name: 'Alchemist Bar',
    category: 'entertainment',
    city: 'Westlands',
    country: 'KE',
    average_rating: 4.5,
    ratings_count: 178,
    tier: 'standard',
    distance: '2.0 km',
  },
  {
    id: '6',
    name: 'Bomas of Kenya',
    category: 'culture',
    city: 'Langata',
    country: 'KE',
    average_rating: 4.4,
    ratings_count: 321,
    tier: 'standard',
    distance: '6.3 km',
  },
];


export default function MobileHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleSave, isSaved, isLoaded } = useSavedGems();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter gems by category
  const filteredGems = selectedCategory
    ? mockGems.filter((gem) => gem.category === selectedCategory)
    : mockGems;

  const nearYouGems = [...filteredGems].sort((a, b) => {
    const distA = parseFloat(a.distance?.replace(' km', '') || '999');
    const distB = parseFloat(b.distance?.replace(' km', '') || '999');
    return distA - distB;
  });

  const featuredGems = filteredGems.filter((gem) => gem.tier === 'featured');

  const popularGems = [...filteredGems].sort(
    (a, b) => b.ratings_count - a.ratings_count
  );

  const showContent = !isLoading && isLoaded;

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white pt-safe sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Location */}
            <button className="flex items-center gap-2 touch-feedback rounded-lg -ml-1 p-1">
              <div className="w-9 h-9 bg-[#00AA6C]/10 rounded-full flex items-center justify-center">
                <MapPin className="h-[18px] w-[18px] text-[#00AA6C]" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                  Location
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Nairobi, Kenya
                </p>
              </div>
            </button>

            {/* Notifications */}
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center relative touch-feedback">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-5 pb-6">
        {/* Search Bar */}
        <Link
          href="/m/search"
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-gray-200 shadow-sm mb-6 touch-feedback"
        >
          <Search className="h-5 w-5 text-gray-400" />
          <span className="text-gray-400 text-[15px]">Search for gems...</span>
        </Link>

        {/* Category Pills */}
        <div className="mb-6">
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Near You Section */}
        <section className="mb-8">
          <SectionHeader title="Near You" href="/m/explore?sort=distance" />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch -mx-4 px-4 pb-1">
            {showContent ? (
              nearYouGems.slice(0, 5).map((gem) => (
                <GemCard
                  key={gem.id}
                  gem={gem}
                  variant="horizontal"
                  isSaved={isSaved(gem.id)}
                  onToggleSave={toggleSave}
                />
              ))
            ) : (
              <>
                <GemCardSkeleton variant="horizontal" />
                <GemCardSkeleton variant="horizontal" />
                <GemCardSkeleton variant="horizontal" />
              </>
            )}
          </div>
        </section>

        {/* Featured Gems Section */}
        {featuredGems.length > 0 && (
          <section className="mb-8">
            <SectionHeader title="Featured Gems" href="/m/explore?filter=featured" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch -mx-4 px-4 pb-1">
              {showContent ? (
                featuredGems.map((gem) => (
                  <GemCard
                    key={gem.id}
                    gem={gem}
                    variant="horizontal"
                    isSaved={isSaved(gem.id)}
                    onToggleSave={toggleSave}
                  />
                ))
              ) : (
                <>
                  <GemCardSkeleton variant="horizontal" />
                  <GemCardSkeleton variant="horizontal" />
                </>
              )}
            </div>
          </section>
        )}

        {/* Popular Section */}
        <section>
          <SectionHeader title="Popular" href="/m/explore?sort=popular" />
          <div className="grid grid-cols-2 gap-3">
            {showContent ? (
              popularGems.slice(0, 4).map((gem) => (
                <GemCard
                  key={gem.id}
                  gem={gem}
                  variant="vertical"
                  isSaved={isSaved(gem.id)}
                  onToggleSave={toggleSave}
                  showCategory
                />
              ))
            ) : (
              <>
                <GemCardSkeleton variant="vertical" />
                <GemCardSkeleton variant="vertical" />
                <GemCardSkeleton variant="vertical" />
                <GemCardSkeleton variant="vertical" />
              </>
            )}
          </div>
        </section>

        {/* Empty state when filtering returns no results */}
        {showContent && filteredGems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No gems found in this category</p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-2 text-[#00AA6C] font-medium"
            >
              View all gems
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
