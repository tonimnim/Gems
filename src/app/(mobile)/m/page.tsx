'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Bell, Search, Loader2 } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { createClient } from '@/lib/supabase/client';
import {
  GemCard,
  GemCardSkeleton,
  SectionHeader,
  CategoryPills,
  type GemCardData,
} from '@/components/mobile';
import type { GemCategory } from '@/types';

export default function MobileHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(null);
  const [gems, setGems] = useState<GemCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleSave, isSaved, isLoaded } = useSavedGems();

  // Fetch gems from database
  const fetchGems = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      let query = supabase
        .from('gems')
        .select('id, name, category, city, country, average_rating, ratings_count, tier')
        .eq('status', 'approved')
        .gt('current_term_end', new Date().toISOString())
        .order('tier', { ascending: false })
        .order('ratings_count', { ascending: false })
        .limit(20);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gems:', error);
        setGems([]);
      } else {
        // Map to GemCardData format
        const gemCards: GemCardData[] = (data || []).map((gem) => ({
          id: gem.id,
          name: gem.name,
          category: gem.category,
          city: gem.city,
          country: gem.country,
          average_rating: gem.average_rating,
          ratings_count: gem.ratings_count,
          tier: gem.tier,
        }));
        setGems(gemCards);
      }
    } catch (error) {
      console.error('Error fetching gems:', error);
      setGems([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  const featuredGems = gems.filter((gem) => gem.tier === 'featured');
  const popularGems = [...gems].sort((a, b) => b.ratings_count - a.ratings_count);

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
                  Kenya
                </p>
              </div>
            </button>

            {/* Notifications */}
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center relative touch-feedback">
              <Bell className="h-5 w-5 text-gray-600" />
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

        {/* Featured Gems Section */}
        {(isLoading || featuredGems.length > 0) && (
          <section className="mb-8">
            <SectionHeader title="Featured Gems" href="/m/explore?filter=featured" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch -mx-4 px-4 pb-1">
              {showContent ? (
                featuredGems.length > 0 ? (
                  featuredGems.map((gem) => (
                    <GemCard
                      key={gem.id}
                      gem={gem}
                      variant="horizontal"
                      isSaved={isSaved(gem.id)}
                      onToggleSave={toggleSave}
                    />
                  ))
                ) : null
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
              popularGems.length > 0 ? (
                popularGems.slice(0, 6).map((gem) => (
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
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-500">No gems available yet</p>
                </div>
              )
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
        {showContent && gems.length === 0 && selectedCategory && (
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
