'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { createClient } from '@/lib/supabase/client';
import { GemCard, GemCardSkeleton, type GemCardData } from '@/components/mobile';
export default function SavedPage() {
  const { savedGems, toggleSave, isSaved, isLoaded } = useSavedGems();
  const [savedGemData, setSavedGemData] = useState<GemCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved gems from database
  useEffect(() => {
    async function fetchSavedGems() {
      if (!isLoaded || savedGems.length === 0) {
        setSavedGemData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('gems')
          .select('id, name, category, city, country, average_rating, ratings_count, tier')
          .in('id', savedGems)
          .eq('status', 'approved');

        if (error) {
          console.error('Error fetching saved gems:', error);
          setSavedGemData([]);
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
          setSavedGemData(gemCards);
        }
      } catch (error) {
        console.error('Error fetching saved gems:', error);
        setSavedGemData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedGems();
  }, [savedGems, isLoaded]);

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white pt-safe sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Saved</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {savedGems.length} {savedGems.length === 1 ? 'gem' : 'gems'} saved
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {!isLoaded || isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <GemCardSkeleton variant="vertical" />
            <GemCardSkeleton variant="vertical" />
          </div>
        ) : savedGems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No saved gems yet
            </h2>
            <p className="text-gray-500 text-sm max-w-[240px]">
              Tap the heart icon on any gem to save it for later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedGemData.map((gem) => (
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
        )}
      </main>
    </div>
  );
}
