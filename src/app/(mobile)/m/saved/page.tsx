'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { GemCard, GemCardSkeleton, type GemCardData } from '@/components/mobile';

// Mock data - in real app, fetch saved gems from API based on IDs
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
  },
];

export default function SavedPage() {
  const { savedGems, toggleSave, isSaved, isLoaded } = useSavedGems();
  const [savedGemData, setSavedGemData] = useState<GemCardData[]>([]);

  // In real app, fetch saved gems from API
  useEffect(() => {
    if (isLoaded) {
      // Filter mock data to only show saved gems
      const saved = mockGems.filter((gem) => savedGems.includes(gem.id));
      setSavedGemData(saved);
    }
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
        {!isLoaded ? (
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
