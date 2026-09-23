/**
 * Geocoding service with automatic offline NCR dictionary fallback
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const cache = new Map();

// Local NCR offline geocoding dictionary for fast, resilient searches
const NCR_OFFLINE_PLACES = [
  // Delhi
  { displayName: 'Karol Bagh, New Delhi, Delhi, India', shortName: 'Karol Bagh', lat: 28.6514, lng: 77.1907, city: 'Delhi' },
  { displayName: 'Connaught Place, New Delhi, Delhi, India', shortName: 'Connaught Place', lat: 28.6315, lng: 77.2167, city: 'Delhi' },
  { displayName: 'Saket, New Delhi, Delhi, India', shortName: 'Saket', lat: 28.5244, lng: 77.2100, city: 'Delhi' },
  { displayName: 'Dwarka, New Delhi, Delhi, India', shortName: 'Dwarka', lat: 28.5921, lng: 77.0460, city: 'Delhi' },
  { displayName: 'Rohini, New Delhi, Delhi, India', shortName: 'Rohini', lat: 28.7041, lng: 77.1025, city: 'Delhi' },
  { displayName: 'Chandni Chowk, Old Delhi, Delhi, India', shortName: 'Chandni Chowk', lat: 28.6506, lng: 77.2303, city: 'Delhi' },
  { displayName: 'Lajpat Nagar, New Delhi, Delhi, India', shortName: 'Lajpat Nagar', lat: 28.5677, lng: 77.2433, city: 'Delhi' },
  { displayName: 'Janakpuri, New Delhi, Delhi, India', shortName: 'Janakpuri', lat: 28.6219, lng: 77.0878, city: 'Delhi' },
  { displayName: 'Pitampura, New Delhi, Delhi, India', shortName: 'Pitampura', lat: 28.6989, lng: 77.1384, city: 'Delhi' },
  { displayName: 'Nehru Place, New Delhi, Delhi, India', shortName: 'Nehru Place', lat: 28.5494, lng: 77.2519, city: 'Delhi' },
  { displayName: 'Hauz Khas, New Delhi, Delhi, India', shortName: 'Hauz Khas', lat: 28.5494, lng: 77.2001, city: 'Delhi' },
  { displayName: 'Vasant Kunj, New Delhi, Delhi, India', shortName: 'Vasant Kunj', lat: 28.5293, lng: 77.1539, city: 'Delhi' },
  { displayName: 'Model Town, New Delhi, Delhi, India', shortName: 'Model Town', lat: 28.7026, lng: 77.1937, city: 'Delhi' },
  { displayName: 'Punjabi Bagh, New Delhi, Delhi, India', shortName: 'Punjabi Bagh', lat: 28.6744, lng: 77.1328, city: 'Delhi' },
  { displayName: 'Mayur Vihar, New Delhi, Delhi, India', shortName: 'Mayur Vihar', lat: 28.6083, lng: 77.2944, city: 'Delhi' },

  // Noida
  { displayName: 'Sector 18, Noida, Gautam Buddha Nagar, Uttar Pradesh, India', shortName: 'Sector 18 Noida', lat: 28.5708, lng: 77.3261, city: 'Noida' },
  { displayName: 'Sector 62, Noida, Gautam Buddha Nagar, Uttar Pradesh, India', shortName: 'Sector 62 Noida', lat: 28.6273, lng: 77.3725, city: 'Noida' },
  { displayName: 'Sector 137, Noida, Gautam Buddha Nagar, Uttar Pradesh, India', shortName: 'Sector 137 Noida', lat: 28.5034, lng: 77.4042, city: 'Noida' },
  { displayName: 'Knowledge Park, Noida, Uttar Pradesh, India', shortName: 'Knowledge Park Noida', lat: 28.4602, lng: 77.4977, city: 'Noida' },
  { displayName: 'Noida Extension, Greater Noida West, Uttar Pradesh, India', shortName: 'Noida Extension', lat: 28.6063, lng: 77.4379, city: 'Noida' },
  { displayName: 'Sector 50, Noida, Uttar Pradesh, India', shortName: 'Sector 50 Noida', lat: 28.5772, lng: 77.3639, city: 'Noida' },
  { displayName: 'Sector 76, Noida, Uttar Pradesh, India', shortName: 'Sector 76 Noida', lat: 28.5684, lng: 77.3821, city: 'Noida' },
  { displayName: 'Film City, Sector 16A, Noida, Uttar Pradesh, India', shortName: 'Film City Noida', lat: 28.5614, lng: 77.3168, city: 'Noida' },
  { displayName: 'Botanical Garden, Noida, Uttar Pradesh, India', shortName: 'Botanical Garden Noida', lat: 28.5645, lng: 77.3342, city: 'Noida' },

  // Gurugram
  { displayName: 'Cyber City, DLF Phase 2, Gurugram, Haryana, India', shortName: 'Cyber City Gurugram', lat: 28.4950, lng: 77.0895, city: 'Gurugram' },
  { displayName: 'MG Road, Gurugram, Haryana, India', shortName: 'MG Road Gurugram', lat: 28.4800, lng: 77.0800, city: 'Gurugram' },
  { displayName: 'DLF Phase 3, Gurugram, Haryana, India', shortName: 'DLF Phase 3 Gurugram', lat: 28.4925, lng: 77.0945, city: 'Gurugram' },
  { displayName: 'Golf Course Road, Gurugram, Haryana, India', shortName: 'Golf Course Road', lat: 28.4550, lng: 77.0970, city: 'Gurugram' },
  { displayName: 'Sohna Road, Gurugram, Haryana, India', shortName: 'Sohna Road Gurugram', lat: 28.4100, lng: 77.0400, city: 'Gurugram' },
  { displayName: 'Sector 29, Gurugram, Haryana, India', shortName: 'Sector 29 Gurugram', lat: 28.4682, lng: 77.0634, city: 'Gurugram' },
  { displayName: 'Huda City Centre, Gurugram, Haryana, India', shortName: 'Huda City Centre', lat: 28.4593, lng: 77.0725, city: 'Gurugram' },
  { displayName: 'Sector 56, Gurugram, Haryana, India', shortName: 'Sector 56 Gurugram', lat: 28.4315, lng: 77.1042, city: 'Gurugram' },
  { displayName: 'Udyog Vihar, Gurugram, Haryana, India', shortName: 'Udyog Vihar Gurugram', lat: 28.5024, lng: 77.0818, city: 'Gurugram' },

  // Ghaziabad
  { displayName: 'Indirapuram, Ghaziabad, Uttar Pradesh, India', shortName: 'Indirapuram Ghaziabad', lat: 28.6415, lng: 77.3712, city: 'Ghaziabad' },
  { displayName: 'Vaishali, Ghaziabad, Uttar Pradesh, India', shortName: 'Vaishali Ghaziabad', lat: 28.6468, lng: 77.3400, city: 'Ghaziabad' },
  { displayName: 'Vasundhara, Ghaziabad, Uttar Pradesh, India', shortName: 'Vasundhara Ghaziabad', lat: 28.6600, lng: 77.3650, city: 'Ghaziabad' },
  { displayName: 'Raj Nagar, Ghaziabad, Uttar Pradesh, India', shortName: 'Raj Nagar Ghaziabad', lat: 28.6850, lng: 77.4420, city: 'Ghaziabad' },
  { displayName: 'Crossings Republik, Ghaziabad, Uttar Pradesh, India', shortName: 'Crossings Republik', lat: 28.6300, lng: 77.4350, city: 'Ghaziabad' },
  { displayName: 'Sahibabad, Ghaziabad, Uttar Pradesh, India', shortName: 'Sahibabad Ghaziabad', lat: 28.6700, lng: 77.3600, city: 'Ghaziabad' },

  // Faridabad
  { displayName: 'NIT Faridabad, Faridabad, Haryana, India', shortName: 'NIT Faridabad', lat: 28.3900, lng: 77.3000, city: 'Faridabad' },
  { displayName: 'Sector 15, Faridabad, Haryana, India', shortName: 'Sector 15 Faridabad', lat: 28.4050, lng: 77.3200, city: 'Faridabad' },
  { displayName: 'Greater Faridabad, Haryana, India', shortName: 'Greater Faridabad', lat: 28.4200, lng: 77.3400, city: 'Faridabad' },
  { displayName: 'Ballabhgarh, Faridabad, Haryana, India', shortName: 'Ballabhgarh', lat: 28.3400, lng: 77.3300, city: 'Faridabad' },
  { displayName: 'Surajkund, Faridabad, Haryana, India', shortName: 'Surajkund Faridabad', lat: 28.4674, lng: 77.2828, city: 'Faridabad' },

  // Greater Noida
  { displayName: 'Pari Chowk, Greater Noida, Uttar Pradesh, India', shortName: 'Pari Chowk', lat: 28.4645, lng: 77.5090, city: 'Greater Noida' },
  { displayName: 'Alpha 2, Greater Noida, Uttar Pradesh, India', shortName: 'Alpha 2 Greater Noida', lat: 28.4720, lng: 77.5140, city: 'Greater Noida' },
  { displayName: 'Omega 1, Greater Noida, Uttar Pradesh, India', shortName: 'Omega 1 Greater Noida', lat: 28.4550, lng: 77.5250, city: 'Greater Noida' },
  { displayName: 'Greater Noida West, Uttar Pradesh, India', shortName: 'Greater Noida West', lat: 28.6050, lng: 77.4400, city: 'Greater Noida' },
  { displayName: 'Surajpur, Greater Noida, Uttar Pradesh, India', shortName: 'Surajpur Greater Noida', lat: 28.5200, lng: 77.4900, city: 'Greater Noida' }
];

function searchOfflineDictionary(query) {
  const cleanQ = query.toLowerCase().trim();
  const matched = NCR_OFFLINE_PLACES.filter(place =>
    place.displayName.toLowerCase().includes(cleanQ) ||
    place.shortName.toLowerCase().includes(cleanQ)
  );
  return matched;
}

/**
 * Search for places with automatic online + offline fallback
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = query.toLowerCase().trim();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Check offline dictionary first if query matches NCR places
  const offlineMatches = searchOfflineDictionary(query);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
      {
        headers: { 'User-Agent': 'SafetyWatch/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const results = data.map(item => ({
          displayName: item.display_name,
          shortName: item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));

        cache.set(cacheKey, results);
        return results;
      }
    }
  } catch (err) {
    // Graceful fallback to offline NCR dictionary without crashing
  }

  // Fallback to offline matches
  cache.set(cacheKey, offlineMatches);
  return offlineMatches;
}

/**
 * Reverse geocode coordinates with offline fallback
 */
export async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: { 'User-Agent': 'SafetyWatch/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const result = {
        displayName: data.display_name,
        shortName: data.display_name.split(',')[0],
        lat,
        lng,
      };
      cache.set(cacheKey, result);
      return result;
    }
  } catch (err) {}

  // Fallback nearest offline match
  let closest = NCR_OFFLINE_PLACES[0];
  let minDist = Infinity;
  NCR_OFFLINE_PLACES.forEach(p => {
    const dist = Math.hypot(p.lat - lat, p.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  });

  cache.set(cacheKey, closest);
  return closest;
}
