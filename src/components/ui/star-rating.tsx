'use client';

import { cn } from '@/lib/utils';
import { Star, StarHalf } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalf = !isFilled && i === Math.ceil(rating) && rating % 1 >= 0.5;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRatingChange?.(i)}
        className={cn(
          'transition-transform',
          interactive && 'cursor-pointer hover:scale-110',
          !interactive && 'cursor-default'
        )}
      >
        {isHalf ? (
          <StarHalf
            className={cn(sizeMap[size], 'fill-yellow-400 text-yellow-400')}
          />
        ) : (
          <Star
            className={cn(
              sizeMap[size],
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        )}
      </button>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {stars}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-[var(--foreground-muted)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
