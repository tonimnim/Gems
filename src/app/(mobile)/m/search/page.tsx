'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { GemCard, type GemCardData } from '@/components/mobile';
import { cn } from '@/lib/utils';

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
];

const trendingSearches = [
  'Restaurants',
  'Nature walks',
  'Art galleries',
  'Rooftop bars',
  'Hidden beaches',
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { toggleSave, isSaved } = useSavedGems();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return mockGems.filter(
      (gem) =>
        gem.name.toLowerCase().includes(lowerQuery) ||
        gem.city.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleTrendingClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const showResults = query.trim().length > 0;
  const showTrending = !showResults;

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header with Search Input */}
      <header className="bg-white pt-safe sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div
            className={cn(
              'flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3 transition-all',
              isFocused && 'ring-2 ring-[#00AA6C] bg-white'
            )}
          >
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search for gems..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-[15px] outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center touch-feedback"
              >
                <X className="h-3.5 w-3.5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {/* Trending searches */}
        {showTrending && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-500">Trending</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleTrendingClick(term)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 touch-feedback"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {showResults && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &quot;{query}&quot;
            </p>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((gem) => (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No gems found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
