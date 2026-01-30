'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { GemCard, CategoryFilter } from '@/components/gems';
import { AFRICAN_COUNTRIES, FREE_TRIAL } from '@/constants';
import { createClient } from '@/lib/supabase/client';
import type { Gem, GemCategory } from '@/types';

function ExploreContent() {
  const searchParams = useSearchParams();
  const [gems, setGems] = useState<Gem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(
    (searchParams.get('category') as GemCategory) || null
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(
    searchParams.get('country') || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch gems from database
  const fetchGems = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      let query = supabase
        .from('gems')
        .select(`
          *,
          media:gem_media(*)
        `)
        .eq('status', 'approved')
        .order('tier', { ascending: false })
        .order('created_at', { ascending: false });

      // During free trial, show all approved gems
      // Otherwise, only show gems with valid subscription
      if (!FREE_TRIAL.enabled) {
        query = query.gt('current_term_end', new Date().toISOString());
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (selectedCountry) {
        query = query.eq('country', selectedCountry);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gems:', error);
        setGems([]);
      } else {
        setGems(data || []);
      }
    } catch (error) {
      console.error('Error fetching gems:', error);
      setGems([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedCountry, searchQuery]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
          </div>
        ) : gems.length > 0 ? (
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
