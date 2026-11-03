/**
 * Geocoding Service for Place Search Autocomplete & Reverse Geocoding
 * Powered by OpenStreetMap Nominatim with in-memory caching and debouncing.
 */

export interface GeocodingResult {
  placeId: number;
  name: string;
  displayName: string;
  address: string;
  latitude: number;
  longitude: number;
}

const searchCache = new Map<string, GeocodingResult[]>();
const reverseCache = new Map<string, string>();

/**
 * Search locations by query string (autocomplete for addresses, landmarks, office buildings)
 */
export async function searchLocations(query: string, limit = 5): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = `${trimmed.toLowerCase()}_${limit}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&limit=${limit}&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn('Geocoding search failed with status:', res.status);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const results: GeocodingResult[] = data.map((item: any) => {
      // Extract a short readable name if available
      const parts = (item.display_name || '').split(',');
      const shortName = parts[0]?.trim() || trimmed;
      const fullAddress = item.display_name || '';

      return {
        placeId: item.place_id,
        name: shortName,
        displayName: item.display_name,
        address: fullAddress,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      };
    });

    searchCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.error('Error in searchLocations:', err);
    return [];
  }
}

/**
 * Reverse geocode latitude & longitude to a human-readable street address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  // Round coordinates to 4 decimal places for caching (~11 meters)
  const latKey = latitude.toFixed(4);
  const lonKey = longitude.toFixed(4);
  const cacheKey = `${latKey},${lonKey}`;

  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn('Reverse geocoding failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    const address = data?.display_name || null;

    if (address) {
      reverseCache.set(cacheKey, address);
    }
    return address;
  } catch (err) {
    console.error('Error in reverseGeocode:', err);
    return null;
  }
}

