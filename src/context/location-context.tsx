'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LocationData {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  countryCode?: string;
  source: 'gps' | 'ip' | 'none';
}

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
  requestGPSLocation: () => Promise<void>;
  fetchIPLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  // Check permission state on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        result.onchange = () => {
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        };
      }).catch(() => {
        setPermissionState('unknown');
      });
    }
  }, []);

  // Fetch location from IP on mount (silent, no user action needed)
  const fetchIPLocation = useCallback(async () => {
    // Don't refetch if we already have location
    if (location?.source === 'gps') return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ip-api.com/json/?fields=status,message,country,countryCode,city,lat,lon');
      const data = await response.json();

      if (data.status === 'success') {
        setLocation({
          latitude: data.lat,
          longitude: data.lon,
          city: data.city,
          country: data.country,
          countryCode: data.countryCode,
          source: 'ip',
        });
      } else {
        setError('Could not detect location');
        setLocation({ source: 'none' });
      }
    } catch (err) {
      console.error('IP location error:', err);
      setError('Could not detect location');
      setLocation({ source: 'none' });
    } finally {
      setIsLoading(false);
    }
  }, [location?.source]);

  // Request GPS location (requires user permission)
  const requestGPSLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city/country
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();

        setLocation({
          latitude,
          longitude,
          city: data.city || data.locality || data.principalSubdivision,
          country: data.countryName,
          countryCode: data.countryCode,
          source: 'gps',
        });
        setPermissionState('granted');
      } catch {
        // Even if reverse geocode fails, we have coordinates
        setLocation({
          latitude,
          longitude,
          source: 'gps',
        });
        setPermissionState('granted');
      }
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setPermissionState('denied');
        setError('Location permission denied');
        // Fall back to IP location
        await fetchIPLocation();
      } else {
        setError('Could not get location');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchIPLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        permissionState,
        requestGPSLocation,
        fetchIPLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
