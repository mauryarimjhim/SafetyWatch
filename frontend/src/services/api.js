const API_BASE = import.meta.env.VITE_API_BASE || 'https://crime-map-m4xc.onrender.com/api';

/**
 * Fetch crime data for a city with optional filters
 */
export async function fetchCrimes(city, filters = {}) {
  const params = new URLSearchParams({ city, ...filters });
  const res = await fetch(`${API_BASE}/crimes?${params}`);
  if (!res.ok) throw new Error('Failed to fetch crimes');
  return res.json();
}

/**
 * Fetch analytics data for a city
 */
export async function fetchAnalytics(city) {
  const res = await fetch(`${API_BASE}/analytics?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

/**
 * Fetch nearby police stations
 */
export async function fetchPoliceStations(lat, lng) {
  const res = await fetch(`${API_BASE}/emergency/stations?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

/**
 * Send SOS alert
 */
export async function sendSOSAlert(lat, lng) {
  const res = await fetch(`${API_BASE}/emergency/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, timestamp: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error('Failed to send SOS');
  return res.json();
}

/**
 * Report a crime
 */
export async function reportCrime(crimeData) {
  const res = await fetch(`${API_BASE}/crimes/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crimeData),
  });
  if (!res.ok) throw new Error('Failed to report crime');
  return res.json();
}
