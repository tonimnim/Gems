'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SlidersHorizontal, Loader2, MapPin } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { useLocation } from '@/context/location-context';
import { createClient } from '@/lib/supabase/client';
import { FREE_TRIAL, AFRICAN_COUNTRIES } from '@/constants';
import {
  GemCard,
  GemCardSkeleton,
  CategoryPills,
  type GemCardData,
} from '@/components/mobile';
import type { GemCategory } from '@/types';

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(null);
  const [gems, setGems] = useState<GemCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleSave, isSaved } = useSavedGems();

  // Location context
  const { location, isLoading: locationLoading, fetchIPLocation } = useLocation();
  const hasAutoFilteredRef = useRef(false);

  // Fetch IP location on mount
  useEffect(() => {
    fetchIPLocation();
  }, [fetchIPLocation]);

  // Get country name for display
  const countryName = location?.countryCode
    ? AFRICAN_COUNTRIES.find((c) => c.code === location.countryCode)?.name || location.country
    : null;

  const fetchGems = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      let query = supabase
        .from('gems')
        .select(`
          id, name, category, city, country, average_rating, ratings_count, tier,
          media:gem_media(url, is_cover)
        `)
        .eq('status', 'approved')
        .order('tier', { ascending: false })
        .order('ratings_count', { ascending: false })
        .limit(50);

      // During free trial, show all approved gems
      // Otherwise, only show gems with valid subscription
      if (!FREE_TRIAL.enabled) {
        query = query.gt('current_term_end', new Date().toISOString());
      }

      // Filter by user's country
      if (location?.countryCode) {
        query = query.eq('country', location.countryCode);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gems:', error);
        setGems([]);
      } else {
        const gemCards: GemCardData[] = (data || []).map((gem) => {
          const media = gem.media as { url: string; is_cover: boolean }[] | undefined;
          const coverImage = media?.find((m) => m.is_cover)?.url || media?.[0]?.url;
          return {
            id: gem.id,
            name: gem.name,
            category: gem.category,
            city: gem.city,
            country: gem.country,
            average_rating: gem.average_rating,
            ratings_count: gem.ratings_count,
            tier: gem.tier,
            cover_image: coverImage,
          };
        });
        setGems(gemCards);
      }
    } catch (error) {
      console.error('Error fetching gems:', error);
      setGems([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, location?.countryCode]);

  useEffect(() => {
    // Only fetch when location is detected or category changes
    if (location?.countryCode || hasAutoFilteredRef.current) {
      fetchGems();
      hasAutoFilteredRef.current = true;
    }
  }, [fetchGems, location?.countryCode]);

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white pt-safe sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {countryName ? `Explore ${countryName}` : 'Explore'}
              </h1>
              {locationLoading ? (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Detecting location...
                </p>
              ) : countryName ? (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Showing gems in your area
                </p>
              ) : null}
            </div>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback">
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            showIcons
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {isLoading ? (
          <>
            <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <GemCardSkeleton variant="vertical" />
              <GemCardSkeleton variant="vertical" />
              <GemCardSkeleton variant="vertical" />
              <GemCardSkeleton variant="vertical" />
            </div>
          </>
        ) : gems.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {gems.length} gems found
            </p>
            <div className="grid grid-cols-2 gap-3">
              {gems.map((gem) => (
                <GemCard
                  key={gem.id}
                  gem={gem}
                  variant="vertical"
                  isSaved={isSaved(gem.id)}
                  onToggleSave={toggleSave}
                  showCategory
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No gems found</p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-2 text-[#00AA6C] font-medium"
              >
                View all gems
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
