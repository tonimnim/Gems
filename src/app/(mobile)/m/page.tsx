'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Bell, Search, Loader2, Navigation, ChevronDown } from 'lucide-react';
import { useSavedGems } from '@/hooks/useSavedGems';
import { useLocation } from '@/context/location-context';
import {
  GemCard,
  GemCardSkeleton,
  SectionHeader,
  CategoryPills,
  type GemCardData,
} from '@/components/mobile';
import type { GemCategory } from '@/types';

// Cache configuration
const CACHE_KEY = 'mobile_gems_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  nearYou: GemCardData[];
  featured: GemCardData[];
  popular: GemCardData[];
  locationKey: string;
  timestamp: number;
}

function getCachedGems(locationKey: string): CachedData | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_TTL;
    const isSameLocation = data.locationKey === locationKey;

    if (isExpired || !isSameLocation) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCachedGems(
  nearYou: GemCardData[],
  featured: GemCardData[],
  popular: GemCardData[],
  locationKey: string
) {
  try {
    const data: CachedData = {
      nearYou,
      featured,
      popular,
      locationKey,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

// Transform API response to GemCardData
function mapToGemCard(gem: Record<string, unknown>): GemCardData {
  const media = gem.media as { url: string; is_cover: boolean }[] | undefined;
  const coverImage = media?.find((m) => m.is_cover)?.url || media?.[0]?.url;
  return {
    id: gem.id as string,
    name: gem.name as string,
    category: gem.category as GemCategory,
    city: gem.city as string,
    country: gem.country as string,
    average_rating: (gem.average_rating as number) || 0,
    ratings_count: (gem.ratings_count as number) || 0,
    tier: (gem.tier as 'standard' | 'featured') || 'standard',
    cover_image: coverImage,
    distance: gem.distance_km ? `${gem.distance_km} km` : undefined,
  };
}

export default function MobileHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<GemCategory | null>(null);
  const [nearYouGems, setNearYouGems] = useState<GemCardData[]>([]);
  const [featuredGems, setFeaturedGems] = useState<GemCardData[]>([]);
  const [popularGems, setPopularGems] = useState<GemCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleSave, isSaved, isLoaded } = useSavedGems();

  // Location context
  const {
    location,
    isLoading: locationLoading,
    permissionState,
    requestGPSLocation,
    fetchIPLocation
  } = useLocation();

  // Track last fetched location to prevent redundant fetches
  const lastFetchedLocationRef = useRef<string | null>(null);

  // Fetch IP location on mount
  useEffect(() => {
    fetchIPLocation();
  }, [fetchIPLocation]);

  // Build location key for cache
  const getLocationKey = useCallback(() => {
    if (location?.source === 'gps' && location.latitude && location.longitude) {
      // Round coordinates to avoid cache misses from tiny GPS variations
      const lat = Math.round(location.latitude * 100) / 100;
      const lng = Math.round(location.longitude * 100) / 100;
      return `gps:${lat},${lng}`;
    }
    return `ip:${location?.countryCode || 'unknown'}:${location?.city || 'unknown'}`;
  }, [location?.source, location?.latitude, location?.longitude, location?.countryCode, location?.city]);

  // Fetch gems when location changes
  useEffect(() => {
    const locationKey = getLocationKey();

    // Skip if we already fetched for this location (and not filtering by category)
    if (lastFetchedLocationRef.current === locationKey && !selectedCategory) {
      return;
    }

    async function fetchGems() {
      // Check cache first (only when no category filter)
      if (!selectedCategory) {
        const cached = getCachedGems(locationKey);
        if (cached) {
          setNearYouGems(cached.nearYou);
          setFeaturedGems(cached.featured);
          setPopularGems(cached.popular);
          setIsLoading(false);
          lastFetchedLocationRef.current = locationKey;
          return;
        }
      }

      setIsLoading(true);
      try {
        // Build URLs based on location type
        let nearYouUrl: string;
        const countryCode = location?.countryCode;

        if (location?.source === 'gps' && location.latitude && location.longitude) {
          nearYouUrl = `/api/gems/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=50000&limit=6`;
        } else {
          const params = new URLSearchParams({ limit: '6' });
          if (countryCode) params.set('country', countryCode);
          if (location?.city) params.set('city', location.city);
          nearYouUrl = `/api/gems?${params.toString()}`;
        }

        // Build params: always filter by country, optionally by category
        const countryParam = countryCode ? `&country=${countryCode}` : '';
        const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
        const featuredUrl = `/api/gems?tier=featured&limit=6${countryParam}${categoryParam}`;
        const popularUrl = `/api/gems?limit=8${countryParam}${categoryParam}`;

        // Fetch all in parallel
        const [nearYouRes, featuredRes, popularRes] = await Promise.all([
          fetch(selectedCategory ? `${nearYouUrl}${categoryParam}` : nearYouUrl),
          fetch(featuredUrl),
          fetch(popularUrl),
        ]);

        const [nearYouData, featuredData, popularData] = await Promise.all([
          nearYouRes.json(),
          featuredRes.json(),
          popularRes.json(),
        ]);

        const nearYou = (nearYouData.data || []).map(mapToGemCard);
        const featured = (featuredData.data || []).map(mapToGemCard);
        const popular = (popularData.data || []).map(mapToGemCard);

        setNearYouGems(nearYou);
        setFeaturedGems(featured);
        setPopularGems(popular);

        // Cache only when no category filter
        if (!selectedCategory) {
          setCachedGems(nearYou, featured, popular, locationKey);
          lastFetchedLocationRef.current = locationKey;
        }
      } catch (error) {
        console.error('Error fetching gems:', error);
        setNearYouGems([]);
        setFeaturedGems([]);
        setPopularGems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGems();
  }, [location, selectedCategory, getLocationKey]);

  // Location display text
  const locationText = location?.city
    ? location.city
    : location?.country || 'Detecting...';

  const showContent = !isLoading && isLoaded;

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white pt-safe sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Location - tappable to request GPS */}
            <button
              onClick={permissionState !== 'granted' ? requestGPSLocation : undefined}
              className="flex items-center gap-2 touch-feedback rounded-lg -ml-1 p-1"
            >
              <div className="w-9 h-9 bg-[#00AA6C]/10 rounded-full flex items-center justify-center">
                {locationLoading ? (
                  <Loader2 className="h-[18px] w-[18px] text-[#00AA6C] animate-spin" />
                ) : (
                  <MapPin className="h-[18px] w-[18px] text-[#00AA6C]" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                  {location?.source === 'gps' ? 'Near You' : 'Location'}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {locationText}
                  </p>
                  {permissionState !== 'granted' && !locationLoading && (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </div>
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

        {/* GPS Enable Prompt - only show when using IP location */}
        {permissionState !== 'granted' && !locationLoading && location?.source === 'ip' && !selectedCategory && (
          <button
            onClick={requestGPSLocation}
            className="w-full flex items-center justify-center gap-2 mb-6 py-2.5 px-4 bg-[#00AA6C]/5 border border-[#00AA6C]/20 rounded-xl text-sm text-[#00AA6C] font-medium touch-feedback"
          >
            <Navigation className="h-4 w-4" />
            Enable location for gems near you
          </button>
        )}

        {/* Near You Section */}
        {(isLoading || nearYouGems.length > 0) && !selectedCategory && (
          <section className="mb-8">
            <SectionHeader
              title={location?.source === 'gps' ? 'Near You' : `In ${locationText}`}
              href={`/m/explore${location?.countryCode ? `?country=${location.countryCode}` : ''}`}
            />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch -mx-4 px-4 pb-1">
              {showContent ? (
                nearYouGems.length > 0 ? (
                  nearYouGems.map((gem) => (
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
                  <GemCardSkeleton variant="horizontal" />
                </>
              )}
            </div>
          </section>
        )}

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
        {showContent && popularGems.length === 0 && selectedCategory && (
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
