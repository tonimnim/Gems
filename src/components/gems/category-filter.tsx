'use client';

import { cn } from '@/lib/utils';
import { GEM_CATEGORIES } from '@/constants';
import type { GemCategory } from '@/types';
import {
  UtensilsCrossed,
  Trees,
  Bed,
  Landmark,
  Mountain,
  Music,
} from 'lucide-react';

const iconMap = {
  UtensilsCrossed,
  Trees,
  Bed,
  Landmark,
  Mountain,
  Music,
};

export interface CategoryFilterProps {
  selectedCategory?: GemCategory | null;
  onCategoryChange: (category: GemCategory | null) => void;
  className?: string;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  const categories = Object.entries(GEM_CATEGORIES) as [
    GemCategory,
    (typeof GEM_CATEGORIES)[GemCategory]
  ][];

  return (
    <div className={cn('overflow-x-auto scrollbar-hide', className)}>
      <div className="flex gap-2 pb-2">
        {/* All button */}
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all',
            !selectedCategory
              ? 'bg-[#092327] text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-[#00AA6C] hover:text-[#00AA6C]'
          )}
        >
          All
        </button>

        {/* Category buttons */}
        {categories.map(([key, category]) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          const isSelected = selectedCategory === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(key)}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                isSelected
                  ? 'bg-[#092327] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-[#00AA6C] hover:text-[#00AA6C]'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
