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

interface CategoryPillsProps {
  selectedCategory: GemCategory | null;
  onSelect: (category: GemCategory | null) => void;
  showIcons?: boolean;
}

export function CategoryPills({
  selectedCategory,
  onSelect,
  showIcons = false,
}: CategoryPillsProps) {
  const categories = Object.entries(GEM_CATEGORIES).map(([key, value]) => ({
    id: key as GemCategory,
    ...value,
  }));

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-1 -mx-4 px-4">
      {/* All category */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 h-10 px-4 rounded-full text-sm font-medium transition-all touch-feedback',
          'flex items-center gap-2',
          selectedCategory === null
            ? 'bg-[#00AA6C] text-white shadow-sm'
            : 'bg-white text-gray-700 border border-gray-200'
        )}
      >
        All
      </button>

      {/* Category pills */}
      {categories.map((category) => {
        const Icon = iconMap[category.icon as keyof typeof iconMap];
        const isSelected = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex-shrink-0 h-10 px-4 rounded-full text-sm font-medium transition-all touch-feedback',
              'flex items-center gap-2 whitespace-nowrap',
              isSelected
                ? 'bg-[#00AA6C] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200'
            )}
          >
            {showIcons && Icon && (
              <Icon className={cn('h-4 w-4', isSelected ? 'text-white' : 'text-gray-500')} />
            )}
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
