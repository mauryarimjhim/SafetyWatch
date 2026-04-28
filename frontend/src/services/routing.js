/**
 * Routing service using OSRM (Open Source Routing Machine)
 * Free, no API key required
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Decode OSRM polyline geometry into array of [lat, lng] pairs
 */
function decodePolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Get route between two points
 * @param {number} fromLat
 * @param {number} fromLng
 * @param {number} toLat
 * @param {number} toLng
 * @param {boolean} alternatives - Request alternative routes
 * @returns {Promise<Array>} Array of route objects
 */
export async function getRoute(fromLat, fromLng, toLat, toLng, alternatives = true) {
  try {
    const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=polyline&alternatives=${alternatives}&steps=true`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`);

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    return data.routes.map((route, index) => ({
      index,
      coordinates: decodePolyline(route.geometry),
      distance: route.distance, // meters
      duration: route.duration, // seconds
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMin: Math.round(route.duration / 60),
      durationFormatted: formatDuration(route.duration),
      legs: route.legs,
    }));
  } catch (err) {
    console.error('Routing error:', err);
    // Fallback: return a straight line
    return [{
      index: 0,
      coordinates: [[fromLat, fromLng], [toLat, toLng]],
      distance: haversineDistance(fromLat, fromLng, toLat, toLng) * 1000,
      duration: 0,
      distanceKm: Math.round(haversineDistance(fromLat, fromLng, toLat, toLng) * 10) / 10,
      durationMin: 0,
      durationFormatted: 'N/A',
      isFallback: true,
    }];
  }
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
