'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedGems } from '@/hooks/useSavedGems';
import { GemCard, SectionHeader, type GemCardData } from '@/components/mobile';
import { GEM_CATEGORIES } from '@/constants';
import type { GemCategory } from '@/types';

// Mock gem data - will be replaced with API call
const mockGem = {
  id: '1',
  name: 'Kazuri Beads Factory',
  category: 'culture' as GemCategory,
  description: `Kazuri, which means "small and beautiful" in Swahili, began in 1975 as a tiny workshop experimenting tried to help two single mothers. Today, Kazuri has grown to become one of Kenya's most successful social enterprises, employing over 340 women.

The factory offers guided tours where you can watch skilled artisans hand-craft beautiful ceramic beads and pottery. Each piece is unique, hand-painted with vibrant African designs. The on-site shop offers a stunning collection of jewelry, home décor, and gifts.

A visit here is not just shopping - it's an experience that supports local women and preserves traditional craftsmanship.`,
  city: 'Karen',
  country: 'Kenya',
  address: 'Mbagathi Ridge, Karen, Nairobi',
  latitude: -1.3167,
  longitude: 36.7167,
  phone: '+254 20 288 2905',
  website: 'https://kazuri.com',
  opening_hours: 'Mon-Sat: 8:30 AM - 5:00 PM\nSun: 10:00 AM - 4:00 PM',
  price_range: 'Free entry, items from KES 200',
  average_rating: 4.8,
  ratings_count: 124,
  tier: 'featured' as const,
  images: [
    '/images/gem-1.jpg',
    '/images/gem-2.jpg',
    '/images/gem-3.jpg',
  ],
};

const mockReviews = [
  {
    id: '1',
    user_name: 'Sarah M.',
    user_avatar: null,
    rating: 5,
    comment: 'Absolutely loved the tour! The women here are so talented and the jewelry is stunning. A must-visit when in Nairobi.',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    user_name: 'James K.',
    user_avatar: null,
    rating: 4,
    comment: 'Great experience and beautiful products. The tour guide was very knowledgeable about the history.',
    created_at: '2024-01-10',
  },
  {
    id: '3',
    user_name: 'Emily R.',
    user_avatar: null,
    rating: 5,
    comment: 'Such an inspiring place! Bought some lovely gifts for friends back home.',
    created_at: '2024-01-05',
  },
];

const similarGems: GemCardData[] = [
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function GemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { toggleSave, isSaved } = useSavedGems();

  const gem = mockGem; // Will fetch by params.id
  const categoryInfo = GEM_CATEGORIES[gem.category];
  const saved = isSaved(gem.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: gem.name,
          text: `Check out ${gem.name} on Hidden Gems!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${gem.latitude},${gem.longitude}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    if (gem.phone) {
      window.location.href = `tel:${gem.phone}`;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === gem.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? gem.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Image Gallery */}
      <div className="relative">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
            <span className="text-6xl opacity-30">
              {categoryInfo?.icon === 'Landmark' && '🏛️'}
              {categoryInfo?.icon === 'UtensilsCrossed' && '🍽️'}
              {categoryInfo?.icon === 'Trees' && '🌳'}
              {categoryInfo?.icon === 'Bed' && '🛏️'}
              {categoryInfo?.icon === 'Mountain' && '⛰️'}
              {categoryInfo?.icon === 'Music' && '🎵'}
            </span>
          </div>

          {/* Image navigation arrows */}
          {gem.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </>
          )}

          {/* Image counter */}
          {gem.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
              <span className="text-xs text-white font-medium">
                {currentImageIndex + 1} / {gem.images.length}
              </span>
            </div>
          )}
        </div>

        {/* Top navigation */}
        <div className="absolute top-0 left-0 right-0 pt-safe">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm touch-feedback"
            >
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm touch-feedback"
              >
                <Share2 className="h-5 w-5 text-gray-900" />
              </button>
              <button
                onClick={() => toggleSave(gem.id)}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm touch-feedback"
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-colors',
                    saved ? 'fill-red-500 text-red-500' : 'text-gray-900'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {categoryInfo?.label}
              </span>
              {gem.tier === 'featured' && (
                <span className="px-2 py-0.5 bg-[#00AA6C]/10 text-[#00AA6C] text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{gem.name}</h1>
          </div>
        </div>

        {/* Rating & Location */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-900">{gem.average_rating}</span>
            <span className="text-gray-500">({gem.ratings_count} reviews)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{gem.address}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00AA6C] text-white font-medium rounded-xl touch-feedback"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </button>
          {gem.phone && (
            <button
              onClick={handleCall}
              className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center touch-feedback"
            >
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
          )}
          {gem.website && (
            <a
              href={gem.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center touch-feedback"
            >
              <Globe className="h-5 w-5 text-gray-600" />
            </a>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-5" />

        {/* About */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
          <div className="relative">
            <p
              className={cn(
                'text-gray-600 text-[15px] leading-relaxed whitespace-pre-line',
                !isDescriptionExpanded && 'line-clamp-4'
              )}
            >
              {gem.description}
            </p>
            {gem.description.length > 200 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-[#00AA6C] font-medium text-sm mt-2"
              >
                {isDescriptionExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-5" />

        {/* Details */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Details</h2>
          <div className="space-y-3">
            {gem.opening_hours && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Opening Hours</p>
                  <p className="text-gray-900 whitespace-pre-line">{gem.opening_hours}</p>
                </div>
              </div>
            )}
            {gem.price_range && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium">$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price Range</p>
                  <p className="text-gray-900">{gem.price_range}</p>
                </div>
              </div>
            )}
            {gem.phone && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${gem.phone}`} className="text-[#00AA6C]">
                    {gem.phone}
                  </a>
                </div>
              </div>
            )}
            {gem.website && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={gem.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00AA6C]"
                  >
                    {gem.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-5" />

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
            <Link
              href={`/m/gem/${gem.id}/reviews`}
              className="text-sm text-[#00AA6C] font-medium flex items-center gap-0.5"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{gem.average_rating}</p>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-3.5 w-3.5',
                      star <= Math.round(gem.average_rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{gem.ratings_count} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : 3;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{rating}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {mockReviews.slice(0, 2).map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {review.user_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{review.user_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-3 w-3',
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-5" />

        {/* Similar Gems */}
        <section className="mb-4">
          <SectionHeader title="Similar Gems" href="/m/explore?category=culture" />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {similarGems.map((similarGem) => (
              <GemCard
                key={similarGem.id}
                gem={similarGem}
                variant="horizontal"
                isSaved={isSaved(similarGem.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleSave(gem.id)}
            className={cn(
              'w-12 h-12 border rounded-xl flex items-center justify-center touch-feedback',
              saved ? 'border-red-200 bg-red-50' : 'border-gray-200'
            )}
          >
            <Heart
              className={cn(
                'h-5 w-5',
                saved ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </button>
          <button
            onClick={handleDirections}
            className="flex-1 py-3.5 bg-[#00AA6C] text-white font-semibold rounded-xl touch-feedback"
          >
            Get Directions
          </button>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
