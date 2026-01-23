'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GEM_CATEGORIES, AFRICAN_COUNTRIES } from '@/constants';
import type { GemStatus, GemCategory } from '@/types';

const STATUS_OPTIONS: { value: GemStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

const CATEGORY_OPTIONS: { value: GemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  ...Object.entries(GEM_CATEGORIES).map(([key, { label }]) => ({
    value: key as GemCategory,
    label,
  })),
];

interface GemFiltersProps {
  countries?: string[];
}

export function GemFilters({ countries = [] }: GemFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current filter values from URL
  const currentStatus = searchParams.get('status') || 'all';
  const currentCategory = searchParams.get('category') || 'all';
  const currentCountry = searchParams.get('country') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const [searchValue, setSearchValue] = useState(currentSearch);

  // Update URL with new filter values
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page when filters change
      params.delete('page');

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  // Handle search input
  const handleSearch = useCallback(() => {
    updateFilters({ search: searchValue });
  }, [searchValue, updateFilters]);

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchValue('');
    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);

  // Check if any filters are active
  const hasActiveFilters =
    currentStatus !== 'all' ||
    currentCategory !== 'all' ||
    currentCountry !== 'all' ||
    currentSearch !== '';

  // Build country options
  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    ...countries.map((code) => {
      const country = AFRICAN_COUNTRIES.find((c) => c.code === code);
      return {
        value: code,
        label: country ? `${country.flag} ${country.name}` : code,
      };
    }),
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Status Filter */}
      <Select
        value={currentStatus}
        onValueChange={(value) => updateFilters({ status: value })}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={currentCategory}
        onValueChange={(value) => updateFilters({ category: value })}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Country Filter */}
      <Select
        value={currentCountry}
        onValueChange={(value) => updateFilters({ country: value })}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {countryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search Input */}
      <div className="flex flex-1 gap-2 sm:min-w-[200px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            disabled={isPending}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSearch}
          disabled={isPending}
        >
          Search
        </Button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          disabled={isPending}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="mr-1 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

// Loading skeleton for the filters
export function GemFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-9 w-full sm:w-[160px] animate-pulse rounded-md bg-gray-200" />
      <div className="h-9 w-full sm:w-[180px] animate-pulse rounded-md bg-gray-200" />
      <div className="h-9 w-full sm:w-[180px] animate-pulse rounded-md bg-gray-200" />
      <div className="h-9 flex-1 sm:min-w-[200px] animate-pulse rounded-md bg-gray-200" />
    </div>
  );
}
