import { create } from 'zustand';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface CacheState {
  entries: Map<string, CacheEntry<unknown>>;
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T) => void;
  invalidate: (key: string) => void;
  invalidatePrefix: (prefix: string) => void;
  clear: () => void;
}

// Cache TTL: 5 minutes (in milliseconds)
const CACHE_TTL = 5 * 60 * 1000;

export const useCacheStore = create<CacheState>((set, get) => ({
  entries: new Map(),

  get: <T>(key: string): T | null => {
    const entry = get().entries.get(key);
    if (!entry) return null;

    // Check if cache is expired
    const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
    if (isExpired) {
      // Return stale data but mark for refresh
      return entry.data as T;
    }

    return entry.data as T;
  },

  set: <T>(key: string, data: T) => {
    set((state) => {
      const newEntries = new Map(state.entries);
      newEntries.set(key, {
        data,
        timestamp: Date.now(),
        key,
      });
      return { entries: newEntries };
    });
  },

  invalidate: (key: string) => {
    set((state) => {
      const newEntries = new Map(state.entries);
      newEntries.delete(key);
      return { entries: newEntries };
    });
  },

  invalidatePrefix: (prefix: string) => {
    set((state) => {
      const newEntries = new Map(state.entries);
      for (const key of newEntries.keys()) {
        if (key.startsWith(prefix)) {
          newEntries.delete(key);
        }
      }
      return { entries: newEntries };
    });
  },

  clear: () => {
    set({ entries: new Map() });
  },
}));

// Check if cache entry is stale (expired but still usable)
export function isCacheStale(key: string): boolean {
  const store = useCacheStore.getState();
  const entry = store.entries.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > CACHE_TTL;
}

// Hook for cached data fetching with SWR-like behavior
import { useState, useEffect, useCallback } from 'react';

interface UseCachedDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  enabled?: boolean;
}

interface UseCachedDataResult<T> {
  data: T | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCachedData<T>({
  key,
  fetcher,
  enabled = true,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const cache = useCacheStore();
  const [data, setData] = useState<T | null>(() => cache.get<T>(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const cachedData = cache.get<T>(key);
    const isStale = isCacheStale(key);

    // If we have cached data, show it immediately
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);

      // If not stale, don't refetch
      if (!isStale) {
        return;
      }

      // Fetch in background (stale-while-revalidate)
      setIsValidating(true);
    } else {
      setIsLoading(true);
    }

    try {
      const freshData = await fetcher();
      cache.set(key, freshData);
      setData(freshData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
      // Keep showing stale data on error
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [key, fetcher, enabled, cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    cache.invalidate(key);
    setIsValidating(true);
    try {
      const freshData = await fetcher();
      cache.set(key, freshData);
      setData(freshData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
    } finally {
      setIsValidating(false);
    }
  }, [key, fetcher, cache]);

  return { data, isLoading, isValidating, error, refetch };
}
