/**
 * Geocoding service using Nominatim (OpenStreetMap)
 * Free, no API key required
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Simple cache to avoid repeated requests
const cache = new Map();

/**
 * Search for places by query string
 * @param {string} query
 * @returns {Promise<Array>} Array of { display_name, lat, lon }
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = query.toLowerCase().trim();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
      { headers: { 'User-Agent': 'SafetyWatch/1.0' } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const results = data.map(item => ({
      displayName: item.display_name,
      shortName: item.display_name.split(',')[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    cache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('Geocoding error:', err);
    return [];
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'SafetyWatch/1.0' } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const result = {
      displayName: data.display_name,
      shortName: data.display_name.split(',')[0],
      lat,
      lng,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return null;
  }
}
