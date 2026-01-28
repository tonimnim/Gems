'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface FilterBarProps {
  filters: Filter[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function FilterBar({
  filters,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap',
        className
      )}
    >
      {/* Filter Dropdowns */}
      {filters.map((filter, index) => (
        <Select
          key={`filter-${index}`}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={filter.placeholder || filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Search Input */}
      {onSearchChange && (
        <div className="relative flex-1 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
    </div>
  );
}

// Skeleton for FilterBar loading state
export function FilterBarSkeleton({
  filterCount = 3,
  showSearch = true,
}: {
  filterCount?: number;
  showSearch?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {Array.from({ length: filterCount }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-full sm:w-[180px] animate-pulse rounded-md bg-gray-200"
        />
      ))}
      {showSearch && (
        <div className="h-9 flex-1 sm:min-w-[240px] animate-pulse rounded-md bg-gray-200" />
      )}
    </div>
  );
}

export default FilterBar;
