'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GEM_CATEGORIES, ROUTES } from '@/constants';
import type { Gem } from '@/types';

export interface GemCardProps {
  gem: Gem;
  isFavorite?: boolean;
  onFavoriteToggle?: (gemId: string) => void;
  className?: string;
}

export function GemCard({ gem, isFavorite = false, onFavoriteToggle, className }: GemCardProps) {
  const coverImage = gem.media?.find((m) => m.is_cover)?.url || gem.media?.[0]?.url;
  const category = GEM_CATEGORIES[gem.category];

  return (
    <Link
      href={ROUTES.gem(gem.id)}
      className={cn(
        'group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={gem.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Featured badge */}
        {gem.tier === 'featured' && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#34E0A1] text-[#092327] text-xs font-semibold rounded-full">
            Featured
          </span>
        )}

        {/* Favorite button */}
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteToggle(gem.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-4 w-4 fill-[#00AA6C] text-[#00AA6C]" />
          <span className="font-semibold text-[#1A1A1A]">{gem.average_rating.toFixed(1)}</span>
          <span className="text-gray-500 text-sm">({gem.ratings_count})</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-[#1A1A1A] line-clamp-1 mb-1 group-hover:text-[#00AA6C] transition-colors">
          {gem.name}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{gem.city}, {gem.country}</span>
        </p>

        {/* Category */}
        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
          {category.label}
        </span>
      </div>
    </Link>
  );
}
