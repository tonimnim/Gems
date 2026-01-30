'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X, TrendingUp, Loader2 } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { createClient } from '@/lib/supabase/client';
import { FREE_TRIAL } from '@/constants';
import { GemCard, GemCardSkeleton, type GemCardData } from '@/components/mobile';
import { cn } from '@/lib/utils';
const trendingSearches = [
  'Restaurants',
  'Nature',
  'Culture',
  'Adventure',
  'Entertainment',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<GemCardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toggleSave, isSaved } = useSavedGems();

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const supabase = createClient();
        let searchQuery = supabase
          .from('gems')
          .select('id, name, category, city, country, average_rating, ratings_count, tier')
          .eq('status', 'approved')
          .or(`name.ilike.%${query}%,city.ilike.%${query}%,description.ilike.%${query}%`)
          .order('ratings_count', { ascending: false })
          .limit(20);

        // During free trial, show all approved gems
        if (!FREE_TRIAL.enabled) {
          searchQuery = searchQuery.gt('current_term_end', new Date().toISOString());
        }

        const { data, error } = await searchQuery;

        if (error) {
          console.error('Search error:', error);
          setSearchResults([]);
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
          setSearchResults(gemCards);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSearchResults([]);
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
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#00AA6C]" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
