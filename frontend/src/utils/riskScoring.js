/**
 * Risk scoring for routes based on nearby crime data
 */

/**
 * Calculate distance between two lat/lng points in km (Haversine)
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Score a single point on the route based on nearby crimes
 * @param {number} lat
 * @param {number} lng
 * @param {Array} crimes - Array of { lat, lng, severity, date }
 * @param {number} radiusKm - Search radius in km
 * @returns {number} Risk score 0-100 (higher = more dangerous)
 */
function scorePoint(lat, lng, crimes, radiusKm = 0.5) {
  let riskScore = 0;
  const now = new Date();

  crimes.forEach(crime => {
    const dist = haversine(lat, lng, crime.lat, crime.lng);
    if (dist <= radiusKm) {
      // Distance weight (closer = more dangerous)
      const distWeight = 1 - (dist / radiusKm);

      // Severity weight (1-5 scale)
      const sevWeight = crime.severity / 5;

      // Recency weight (more recent = more weight)
      const daysAgo = Math.max(1, (now - new Date(crime.date)) / (1000 * 60 * 60 * 24));
      const recencyWeight = Math.max(0.1, 1 - (daysAgo / 365));

      riskScore += distWeight * sevWeight * recencyWeight * 20;
    }
  });

  return Math.min(100, Math.round(riskScore));
}

/**
 * Score an entire route
 * @param {Array} routeCoords - Array of [lat, lng]
 * @param {Array} crimes - Array of crime objects
 * @returns {{ overallScore, segments, safetyRating }}
 */
export function scoreRoute(routeCoords, crimes) {
  if (!routeCoords || routeCoords.length === 0) {
    return { overallScore: 100, segments: [], safetyRating: 'Safe' };
  }

  // Sample points along the route (max 50 points for performance)
  const step = Math.max(1, Math.floor(routeCoords.length / 50));
  const sampledPoints = routeCoords.filter((_, i) => i % step === 0);

  const segments = sampledPoints.map(([lat, lng], index) => {
    const risk = scorePoint(lat, lng, crimes);
    return {
      lat,
      lng,
      index,
      risk,
      color: risk >= 60 ? '#ef4444' : risk >= 30 ? '#eab308' : '#22c55e',
      label: risk >= 60 ? 'High Risk' : risk >= 30 ? 'Moderate' : 'Low Risk',
    };
  });

  const avgRisk = segments.reduce((s, seg) => s + seg.risk, 0) / segments.length;
  const overallScore = Math.round(100 - avgRisk);

  let safetyRating = 'Safe';
  if (overallScore < 40) safetyRating = 'Dangerous';
  else if (overallScore < 70) safetyRating = 'Moderate';

  return {
    overallScore,
    segments,
    safetyRating,
    highRiskSegments: segments.filter(s => s.risk >= 60).length,
    totalSegments: segments.length,
  };
}

/**
 * Pick the safest route from alternatives
 * @param {Array} routes - Array of { coordinates: [[lat,lng]], distance, duration }
 * @param {Array} crimes
 * @returns {Array} Routes sorted by safety (safest first)
 */
export function rankRoutesBySafety(routes, crimes) {
  return routes
    .map((route, index) => {
      const scoring = scoreRoute(route.coordinates, crimes);
      return {
        ...route,
        routeIndex: index,
        safetyScore: scoring.overallScore,
        safetyRating: scoring.safetyRating,
        segments: scoring.segments,
        highRiskSegments: scoring.highRiskSegments,
      };
    })
    .sort((a, b) => b.safetyScore - a.safetyScore);
}
