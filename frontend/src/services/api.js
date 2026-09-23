const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * Fetch crime data for a city with optional filters
 */
export async function fetchCrimes(city, filters = {}) {
  try {
    const params = new URLSearchParams({ city, ...filters });
    const res = await fetch(`${API_BASE}/crimes?${params}`);
    if (!res.ok) throw new Error('Failed to fetch crimes');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back:', err);
    throw err;
  }
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
 * Fetch summary for all NCR cities
 */
export async function fetchNCRSummary() {
  const res = await fetch(`${API_BASE}/analytics/ncr-summary`);
  if (!res.ok) throw new Error('Failed to fetch NCR summary');
  return res.json();
}

/**
 * Fetch ML K-Means Danger Zone Clusters
 */
export async function fetchKMeansClusters(city = 'Delhi', k = 6) {
  const res = await fetch(`${API_BASE}/ml/clusters?city=${encodeURIComponent(city)}&k=${k}`);
  if (!res.ok) throw new Error('Failed to fetch ML clusters');
  return res.json();
}

/**
 * Request ML Crime Risk & Probability Prediction
 */
export async function predictMLRisk(payload) {
  const res = await fetch(`${API_BASE}/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to get ML risk prediction');
  return res.json();
}

/**
 * Evaluate Route Safety via ML
 */
export async function evaluateRouteRisk(waypoints) {
  const res = await fetch(`${API_BASE}/ml/route-risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ waypoints })
  });
  if (!res.ok) throw new Error('Failed to evaluate route risk');
  return res.json();
}

/**
 * Send Mobile SMS Text Notification
 */
export async function sendMobileSMS(smsPayload) {
  try {
    const res = await fetch(`${API_BASE}/emergency/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsPayload)
    });
    if (!res.ok) throw new Error('Failed to send SMS');
    return await res.json();
  } catch (e) {
    console.warn('SMS dispatch error:', e);
  }
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
export async function sendSOSAlert(lat, lng, userData = {}) {
  const res = await fetch(`${API_BASE}/emergency/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, timestamp: new Date().toISOString(), ...userData }),
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
