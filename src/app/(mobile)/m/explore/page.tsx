'use client';

import { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import {
  GemCard,
  GemCardSkeleton,
  CategoryPills,
  type GemCardData,
} from '@/components/mobile';
import type { GemCategory } from '@/types';

// Mock data
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
    id: '2',
    name: 'Kitisuru Forest Trail',
    category: 'nature',
    city: 'Kitisuru',
    country: 'KE',
    average_rating: 4.6,
    ratings_count: 89,
    tier: 'standard',
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
  {
    id: '5',
    name: 'Alchemist Bar',
    category: 'entertainment',
    city: 'Westlands',
    country: 'KE',
    average_rating: 4.5,
    ratings_count: 178,
    tier: 'standard',
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
  },
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(null);
  const { toggleSave, isSaved } = useSavedGems();

  const filteredGems = selectedCategory
    ? mockGems.filter((gem) => gem.category === selectedCategory)
    : mockGems;

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
        <p className="text-sm text-gray-500 mb-4">
          {filteredGems.length} gems found
        </p>
        <div className="grid grid-cols-2 gap-3">
          {filteredGems.map((gem) => (
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
      </main>
    </div>
  );
}
