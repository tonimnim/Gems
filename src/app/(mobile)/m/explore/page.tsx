'use client';

import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { createClient } from '@/lib/supabase/client';
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
        .limit(50);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gems:', error);
        setGems([]);
      } else {
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

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white pt-safe sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Explore</h1>
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
