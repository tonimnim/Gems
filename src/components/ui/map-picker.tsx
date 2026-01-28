'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  defaultCountry?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function MapPicker({
  latitude,
  longitude,
  onLocationChange,
}: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [address, setAddress] = useState('');
  const [mapCenter] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : [-1.2921, 36.8219]
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
    return undefined;
  }, []);

  const handlePositionChange = useCallback(async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const addr = await reverseGeocode(lat, lng);
    onLocationChange(lat, lng, addr);
  }, [reverseGeocode, onLocationChange]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Africa')}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setAddress(result.display_name);
    setSearchQuery(result.display_name.split(',')[0]);
    setSearchResults([]);
    onLocationChange(lat, lng, result.display_name);

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported on this device');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 17);
        }
        const addr = await reverseGeocode(lat, lng);
        onLocationChange(lat, lng, addr);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        if (error.code === 1) {
          setLocationError('Location access denied. Please enable GPS.');
        } else if (error.code === 2) {
          setLocationError('Unable to determine location. Try again.');
        } else {
          setLocationError('Location request timed out. Try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (!isMounted) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* GPS Button - Prominent */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={isGettingLocation}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#092327] hover:bg-[#11292E] disabled:bg-gray-300 text-white rounded-lg transition-colors"
      >
        {isGettingLocation ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Getting your location...</span>
          </>
        ) : (
          <>
            <Navigation className="h-5 w-5" />
            <span>Use My Current Location (GPS)</span>
          </>
        )}
      </button>

      {locationError && (
        <p className="text-sm text-red-600 text-center">{locationError}</p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or search manually</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Search Box */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for an address..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-b-0"
              >
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <LeafletMap
        center={mapCenter}
        position={position}
        onPositionChange={handlePositionChange}
        mapRef={mapRef}
      />

      {/* Selected coordinates */}
      {position && (
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <MapPin className="h-4 w-4 text-[#00AA6C] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 truncate">{address || 'Location selected'}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate map component to handle Leaflet
function LeafletMap({
  center,
  position,
  onPositionChange,
  mapRef,
}: {
  center: [number, number];
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
  mapRef: React.MutableRefObject<any>;
}) {
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    // Dynamic import of react-leaflet components
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([reactLeaflet, L]) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        useMapEvents: reactLeaflet.useMapEvents,
      });
    });
  }, []);

  if (!MapComponents) {
    return (
      <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = MapComponents;

  return (
    <div className="relative h-[300px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e: any) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                onPositionChange(pos.lat, pos.lng);
              },
            }}
          />
        )}
        <MapClickHandler onPositionChange={onPositionChange} useMapEvents={MapComponents.useMapEvents} />
      </MapContainer>

      {!position && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm text-gray-600">
            Click on the map to set location
          </div>
        </div>
      )}
    </div>
  );
}

// Click handler using the hook
function MapClickHandler({
  onPositionChange,
  useMapEvents,
}: {
  onPositionChange: (lat: number, lng: number) => void;
  useMapEvents: any;
}) {
  useMapEvents({
    click(e: any) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}
