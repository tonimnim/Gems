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
          'flex-shrink-0 py-1 px-3 rounded-full text-sm font-medium transition-all touch-feedback',
          'flex items-center gap-1.5',
          selectedCategory === null
            ? 'bg-[#00AA6C] text-white'
            : 'bg-gray-50 text-gray-700 border border-gray-100'
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
              'flex-shrink-0 py-1 px-3 rounded-full text-sm font-medium transition-all touch-feedback',
              'flex items-center gap-1.5 whitespace-nowrap',
              isSelected
                ? 'bg-[#00AA6C] text-white'
                : 'bg-gray-50 text-gray-700 border border-gray-100'
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
