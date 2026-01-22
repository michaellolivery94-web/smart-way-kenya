import { useState, useCallback, useRef, useEffect } from "react";

export interface GeocodingResult {
  placeId: string;
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
  type: string;
  importance: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface UseGeocodingOptions {
  debounceMs?: number;
  limit?: number;
  countryCode?: string;
  viewbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  bounded?: boolean;
}

const NAIROBI_VIEWBOX: [number, number, number, number] = [36.65, -1.45, 37.1, -1.15];

export const useGeocoding = (options: UseGeocodingOptions = {}) => {
  const {
    debounceMs = 300,
    limit = 8,
    countryCode = "ke",
    viewbox = NAIROBI_VIEWBOX,
    bounded = false,
  } = options;

  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const search = useCallback(async (query: string) => {
    // Clear previous debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset if query is too short
    if (!query || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        abortControllerRef.current = new AbortController();

        const params = new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: limit.toString(),
          countrycodes: countryCode,
          viewbox: viewbox.join(","),
          bounded: bounded ? "1" : "0",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();

        const mappedResults: GeocodingResult[] = data.map((item: any) => ({
          placeId: item.place_id.toString(),
          displayName: item.display_name,
          shortName: formatShortName(item),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
          importance: item.importance,
          address: item.address,
        }));

        setResults(mappedResults);
        setIsLoading(false);
      } catch (err: any) {
        if (err.name === "AbortError") {
          return; // Ignore aborted requests
        }
        setError(err.message || "Search failed");
        setResults([]);
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, limit, countryCode, viewbox, bounded]);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<GeocodingResult | null> => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: "json",
        addressdetails: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = await response.json();

      if (data.error) {
        return null;
      }

      return {
        placeId: data.place_id.toString(),
        displayName: data.display_name,
        shortName: formatShortName(data),
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        type: data.type,
        importance: 1,
        address: data.address,
      };
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    reverseGeocode,
    clearResults,
  };
};

// Helper to create a short, readable name from geocoding result
function formatShortName(item: any): string {
  const address = item.address || {};
  
  // Priority order for naming
  const parts: string[] = [];
  
  if (address.amenity) parts.push(address.amenity);
  else if (address.shop) parts.push(address.shop);
  else if (address.building) parts.push(address.building);
  else if (address.road) parts.push(address.road);
  else if (item.name) parts.push(item.name);
  
  if (address.suburb && !parts.includes(address.suburb)) {
    parts.push(address.suburb);
  } else if (address.neighbourhood && !parts.includes(address.neighbourhood)) {
    parts.push(address.neighbourhood);
  }
  
  if (address.city && address.city !== "Nairobi") {
    parts.push(address.city);
  } else if (address.town) {
    parts.push(address.town);
  }

  if (parts.length === 0) {
    // Fallback: use first two parts of display_name
    const displayParts = (item.display_name || "").split(",").map((p: string) => p.trim());
    return displayParts.slice(0, 2).join(", ");
  }

  return parts.slice(0, 3).join(", ");
}

// Get current position using browser Geolocation API
export const getCurrentPosition = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};
