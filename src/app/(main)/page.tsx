'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Star,
  ChevronRight,
  UtensilsCrossed,
  Trees,
  Bed,
  Landmark,
  Mountain,
  Music,
  CircleDot,
  Navigation,
  TrendingUp,
  ChevronLeft,
  Loader2,
  MapPinOff,
} from 'lucide-react';
import { GEM_CATEGORIES, ROUTES } from '@/constants';
import { useLocation } from '@/context/location-context';
import type { Gem } from '@/types';

interface GemWithDistance extends Gem {
  distance_km?: string;
  distance_meters?: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  eat_drink: UtensilsCrossed,
  nature: Trees,
  stay: Bed,
  culture: Landmark,
  adventure: Mountain,
  entertainment: Music,
};

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  initials: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: "Gems helped us discover the most amazing rooftop restaurant in Nairobi that we would have never found on our own.",
    author: 'Jane Kamau',
    role: 'Travel Blogger',
    rating: 5,
    initials: 'JK',
  },
  {
    id: '2',
    quote: "Finally, a platform that showcases authentic African experiences! Found a hidden waterfall that wasn't on any other travel site.",
    author: 'David Ochieng',
    role: 'Adventure Enthusiast',
    rating: 5,
    initials: 'DO',
  },
  {
    id: '3',
    quote: "As a food lover, I've discovered so many incredible local restaurants through Gems. Absolutely life-changing!",
    author: 'Amina Hassan',
    role: 'Food Critic',
    rating: 5,
    initials: 'AH',
  },
];

export default function HomePage() {
  const categories = Object.entries(GEM_CATEGORIES);
  const { location, isLoading: locationLoading, permissionState, requestGPSLocation, fetchIPLocation } = useLocation();

  const [nearYouGems, setNearYouGems] = useState<GemWithDistance[]>([]);
  const [featuredGems, setFeaturedGems] = useState<Gem[]>([]);
  const [popularGems, setPopularGems] = useState<Gem[]>([]);
  const [isLoadingGems, setIsLoadingGems] = useState(true);

  const [testimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  // Fetch IP location on mount
  useEffect(() => {
    fetchIPLocation();
  }, [fetchIPLocation]);

  // Fetch gems when location changes
  useEffect(() => {
    async function fetchGems() {
      setIsLoadingGems(true);
      try {
        let nearYouUrl: string;

        // Use GPS coordinates if available, otherwise fall back to country/city
        if (location?.source === 'gps' && location.latitude && location.longitude) {
          // Use PostGIS nearby query for precise location
          nearYouUrl = `/api/gems/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=50000&limit=4`;
        } else {
          // Fall back to country/city filtering
          const nearYouParams = new URLSearchParams({ limit: '4' });
          if (location?.countryCode) {
            nearYouParams.set('country', location.countryCode);
          }
          if (location?.city) {
            nearYouParams.set('city', location.city);
          }
          nearYouUrl = `/api/gems?${nearYouParams.toString()}`;
        }

        // Fetch all gem types in parallel
        const [nearYouRes, featuredRes, popularRes] = await Promise.all([
          fetch(nearYouUrl),
          fetch('/api/gems?tier=featured&limit=4'),
          fetch('/api/gems?limit=4'),
        ]);

        const [nearYouData, featuredData, popularData] = await Promise.all([
          nearYouRes.json(),
          featuredRes.json(),
          popularRes.json(),
        ]);

        setNearYouGems(nearYouData.data || []);
        setFeaturedGems(featuredData.data || []);
        setPopularGems(popularData.data || []);
      } catch (error) {
        console.error('Error fetching gems:', error);
      } finally {
        setIsLoadingGems(false);
      }
    }

    fetchGems();
  }, [location?.countryCode, location?.city, location?.source, location?.latitude, location?.longitude]);

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection('left');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, testimonials.length]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

  // Get cover image for a gem
  const getCoverImage = (gem: Gem) => {
    const media = gem.media as { url: string; is_cover: boolean }[] | undefined;
    const cover = media?.find((m) => m.is_cover) || media?.[0];
    return cover?.url || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80';
  };

  // Location display text
  const locationText = location?.city
    ? `${location.city}, ${location.country || ''}`
    : location?.country || 'your area';

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6">
            Find your next gem..
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-1 flex items-center px-6 py-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Places to go, things to do, gems to discover..."
                  className="w-full text-lg outline-none placeholder:text-gray-400"
                />
              </div>
              <button className="m-2 px-8 py-3 bg-[#34E0A1] hover:bg-[#2BC88E] text-[#092327] font-semibold rounded-full transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-nowrap justify-center gap-1 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide">
            <Link
              href={ROUTES.explore}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-gray-600 hover:text-[#00AA6C] border-b-2 border-transparent hover:border-[#00AA6C] transition-all whitespace-nowrap"
            >
              <CircleDot className="h-4 w-4" />
              <span className="font-medium">Search All</span>
            </Link>
            {categories.slice(0, 5).map(([key, category]) => {
              const Icon = categoryIcons[key] || CircleDot;
              return (
                <Link
                  key={key}
                  href={`${ROUTES.explore}?category=${key}`}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-gray-600 hover:text-[#00AA6C] border-b-2 border-transparent hover:border-[#00AA6C] transition-all whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Promo Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#34E0A1] rounded-3xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1 p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 bg-[#092327] rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-[#34E0A1]" />
                    </div>
                    <span className="font-bold text-[#092327] text-lg">Gems</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#092327] mb-4">
                  Discover Africa&apos;s<br />Best Kept Secrets
                </h2>
                <p className="text-[#11292E] text-lg mb-6">
                  From secret rooftop restaurants to breathtaking viewpoints.
                  Find extraordinary places curated by locals who know.
                </p>
                <Link
                  href={ROUTES.explore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#092327] text-white font-semibold rounded-full hover:bg-[#11292E] transition-colors"
                >
                  Start Exploring
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="flex-1 p-8 hidden md:block">
                <div className="relative h-64">
                  <Image
                    src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80"
                    alt="African landscape"
                    fill
                    className="object-cover rounded-2xl"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Near You Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00AA6C]/10 rounded-full flex items-center justify-center">
                <Navigation className="h-5 w-5 text-[#00AA6C]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                  {location?.source === 'gps' ? 'Near You' : `Gems in ${locationText}`}
                </h2>
                {locationLoading && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Detecting location...
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {permissionState !== 'granted' && !locationLoading && (
                <button
                  onClick={requestGPSLocation}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:border-[#00AA6C] hover:text-[#00AA6C] transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Enable precise location
                </button>
              )}
              <Link
                href={`${ROUTES.explore}${location?.countryCode ? `?country=${location.countryCode}` : ''}`}
                className="flex items-center gap-1 text-[#00AA6C] font-medium hover:underline"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {isLoadingGems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : nearYouGems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearYouGems.map((gem) => (
                <Link
                  key={gem.id}
                  href={`/gem/${gem.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={getCoverImage(gem)}
                      alt={gem.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    {gem.distance_km && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {gem.distance_km} km
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-[#00AA6C] text-[#00AA6C]" />
                      <span className="font-semibold text-[#1A1A1A]">{gem.average_rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-500 text-sm">({gem.ratings_count || 0})</span>
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#00AA6C] transition-colors">
                      {gem.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {gem.city}, {gem.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <MapPinOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No gems found nearby</h3>
              <p className="text-gray-500 mb-4">Be the first to add a gem in {locationText}!</p>
              <Link
                href={ROUTES.register}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00AA6C] text-white font-semibold rounded-full hover:bg-[#008855] transition-colors"
              >
                List Your Gem
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Gems */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                Featured Gems
              </h2>
            </div>
            <Link
              href={`${ROUTES.explore}?tier=featured`}
              className="flex items-center gap-1 text-[#00AA6C] font-medium hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingGems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredGems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGems.map((gem) => (
                <Link
                  key={gem.id}
                  href={`/gem/${gem.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={getCoverImage(gem)}
                      alt={gem.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 bg-amber-400 px-2 py-1 rounded-full text-xs font-semibold text-amber-900">
                      Featured
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-[#00AA6C] text-[#00AA6C]" />
                      <span className="font-semibold text-[#1A1A1A]">{gem.average_rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-500 text-sm">({gem.ratings_count || 0})</span>
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#00AA6C] transition-colors">
                      {gem.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {gem.city}, {gem.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No featured gems yet</h3>
              <p className="text-gray-500">Check back soon for featured listings!</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Gems */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                Popular
              </h2>
            </div>
            <Link
              href={`${ROUTES.explore}?sort=popular`}
              className="flex items-center gap-1 text-[#00AA6C] font-medium hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingGems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularGems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularGems.map((gem) => (
                <Link
                  key={gem.id}
                  href={`/gem/${gem.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={getCoverImage(gem)}
                      alt={gem.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-[#00AA6C] text-[#00AA6C]" />
                      <span className="font-semibold text-[#1A1A1A]">{gem.average_rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-500 text-sm">({(gem.ratings_count || 0).toLocaleString()})</span>
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#00AA6C] transition-colors">
                      {gem.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {gem.city}, {gem.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No popular gems yet</h3>
              <p className="text-gray-500">Be the first to discover and review gems!</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center mb-12">
            What Explorers Say
          </h2>

          <div className="relative">
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>

            <div className="relative overflow-hidden">
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isAnimating
                    ? direction === 'left'
                      ? '-translate-x-full opacity-0'
                      : 'translate-x-full opacity-0'
                    : 'translate-x-0 opacity-100'
                }`}
              >
                <div className="text-center px-8 md:px-16">
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < currentTestimonial.rating
                            ? 'fill-[#00AA6C] text-[#00AA6C]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl text-[#1A1A1A] mb-8 leading-relaxed">
                    &quot;{currentTestimonial.quote}&quot;
                  </blockquote>

                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-[#11292E] rounded-full flex items-center justify-center text-white font-bold">
                      {currentTestimonial.initials}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#1A1A1A]">
                        {currentTestimonial.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {currentTestimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (isAnimating) return;
                    setDirection(idx > currentIndex ? 'left' : 'right');
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-[#00AA6C] w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#092327] rounded-3xl py-16 px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Discover?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of explorers finding extraordinary hidden gems across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={ROUTES.explore}
                className="px-8 py-4 bg-[#34E0A1] text-[#092327] font-semibold rounded-full hover:bg-[#2BC88E] transition-colors"
              >
                Start Exploring
              </Link>
              <Link
                href={ROUTES.register}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                List Your Gem
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
