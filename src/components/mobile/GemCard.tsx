'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Gem, GemCategory } from '@/types';
import { GEM_CATEGORIES } from '@/constants';

export interface GemCardData {
  id: string;
  name: string;
  category: GemCategory;
  city: string;
  country: string;
  average_rating: number;
  ratings_count: number;
  tier: 'standard' | 'featured';
  cover_image?: string;
  distance?: string;
}

interface GemCardProps {
  gem: GemCardData;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  variant?: 'horizontal' | 'vertical';
  showCategory?: boolean;
}

export function GemCard({
  gem,
  isSaved,
  onToggleSave,
  variant = 'vertical',
  showCategory = false,
}: GemCardProps) {
  const categoryInfo = GEM_CATEGORIES[gem.category];

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave(gem.id);
  };

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/m/gem/${gem.id}`}
        className="flex-shrink-0 w-[200px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 touch-feedback"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {gem.cover_image ? (
            <Image
              src={gem.cover_image}
              alt={gem.name}
              fill
              className="object-cover"
              sizes="200px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
              <span className="text-4xl opacity-50">
                {categoryInfo?.icon === 'UtensilsCrossed' && '🍽️'}
                {categoryInfo?.icon === 'Trees' && '🌳'}
                {categoryInfo?.icon === 'Bed' && '🛏️'}
                {categoryInfo?.icon === 'Landmark' && '🏛️'}
                {categoryInfo?.icon === 'Mountain' && '⛰️'}
                {categoryInfo?.icon === 'Music' && '🎵'}
              </span>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSaveClick}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            aria-label={isSaved ? 'Remove from saved' : 'Save gem'}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </button>

          {/* Featured badge */}
          {gem.tier === 'featured' && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-[#00AA6C] text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
            {gem.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">
              {gem.city}
            </span>
            {gem.distance && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-[#00AA6C] font-medium flex-shrink-0">
                  {gem.distance}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-900">
              {gem.average_rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({gem.ratings_count})
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Vertical card (for grid layouts)
  return (
    <Link
      href={`/m/gem/${gem.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 touch-feedback"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {gem.cover_image ? (
          <Image
            src={gem.cover_image}
            alt={gem.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <span className="text-4xl opacity-50">
              {categoryInfo?.icon === 'UtensilsCrossed' && '🍽️'}
              {categoryInfo?.icon === 'Trees' && '🌳'}
              {categoryInfo?.icon === 'Bed' && '🛏️'}
              {categoryInfo?.icon === 'Landmark' && '🏛️'}
              {categoryInfo?.icon === 'Mountain' && '⛰️'}
              {categoryInfo?.icon === 'Music' && '🎵'}
            </span>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          aria-label={isSaved ? 'Remove from saved' : 'Save gem'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </button>

        {/* Featured badge */}
        {gem.tier === 'featured' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-[#00AA6C] text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
            Featured
          </div>
        )}

        {/* Category badge */}
        {showCategory && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
            {categoryInfo?.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
            {gem.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-900">
              {gem.average_rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">
            {gem.city}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader for GemCard
export function GemCardSkeleton({ variant = 'vertical' }: { variant?: 'horizontal' | 'vertical' }) {
  if (variant === 'horizontal') {
    return (
      <div className="flex-shrink-0 w-[200px] bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="aspect-[4/3] skeleton" />
        <div className="p-3 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
          <div className="h-3 skeleton rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}
