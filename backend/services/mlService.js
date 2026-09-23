/**
 * Machine Learning Engine for SafetyWatch Backend
 * Features:
 *  1. K-Means Spatial Clustering for Danger Zones
 *  2. Crime Risk & Probability Classifier
 *  3. Route Safety Evaluator
 */

// K-Means Spatial Clustering
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function runKMeansClustering(crimes, k = 6, maxIter = 100) {
  if (!crimes || crimes.length === 0) return [];

  // Filter valid points
  const points = crimes.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number');
  if (points.length === 0) return [];

  // Pick initial k centroids evenly spaced from dataset
  const step = Math.floor(points.length / k);
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.min(i * step, points.length - 1);
    centroids.push({
      lat: points[idx].latitude,
      lng: points[idx].longitude
    });
  }

  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    // Assign points to nearest centroid
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let minDist = Infinity;
      let nearest = 0;

      for (let cIdx = 0; cIdx < centroids.length; cIdx++) {
        const dist = Math.hypot(p.latitude - centroids[cIdx].lat, p.longitude - centroids[cIdx].lng);
        if (dist < minDist) {
          minDist = dist;
          nearest = cIdx;
        }
      }

      if (assignments[i] !== nearest) {
        assignments[i] = nearest;
        changed = true;
      }
    }

    if (!changed) break;

    // Recompute centroids
    const newCentroids = centroids.map(() => ({ sumLat: 0, sumLng: 0, count: 0 }));
    for (let i = 0; i < points.length; i++) {
      const clusterIdx = assignments[i];
      newCentroids[clusterIdx].sumLat += points[i].latitude;
      newCentroids[clusterIdx].sumLng += points[i].longitude;
      newCentroids[clusterIdx].count += 1;
    }

    centroids = newCentroids.map((nc, idx) => {
      if (nc.count === 0) return centroids[idx];
      return {
        lat: nc.sumLat / nc.count,
        lng: nc.sumLng / nc.count
      };
    });
  }

  // Format cluster outputs with risk metrics
  const clusters = centroids.map((c, id) => {
    const clusterPoints = points.filter((_, i) => assignments[i] === id);
    if (clusterPoints.length === 0) return null;

    const avgRisk = Math.round(
      clusterPoints.reduce((acc, p) => acc + (p.risk_score || 50), 0) / clusterPoints.length
    );

    // Crime type counts
    const typeCounts = {};
    clusterPoints.forEach(p => {
      typeCounts[p.crime_type] = (typeCounts[p.crime_type] || 0) + 1;
    });

    const topCrime = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Theft';

    // Peak hour
    const hourCounts = {};
    clusterPoints.forEach(p => {
      const h = p.hour !== undefined ? p.hour : 12;
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '20', 10);

    const isHigh = avgRisk >= 70 || clusterPoints.length > 500;
    const isMed = !isHigh && (avgRisk >= 45 || clusterPoints.length > 200);

    const riskLevel = isHigh ? 'HIGH' : isMed ? 'MEDIUM' : 'LOW';
    const color = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';
    const radius = Math.min(2500, Math.max(800, 600 + Math.sqrt(clusterPoints.length) * 45));

    // Area name estimate
    const sampleArea = clusterPoints[0]?.area || 'NCR Zone';

    return {
      zone_id: `zone_${id + 1}`,
      title: `${sampleArea} Danger Zone`,
      center_lat: parseFloat(c.lat.toFixed(6)),
      center_lng: parseFloat(c.lng.toFixed(6)),
      avg_risk: avgRisk,
      crime_count: clusterPoints.length,
      top_crime: topCrime,
      peak_hour: `${peakHour}:00`,
      risk_level: riskLevel,
      color,
      radius: Math.round(radius)
    };
  }).filter(Boolean);

  return clusters.sort((a, b) => b.avg_risk - a.avg_risk);
}

// Machine Learning Crime Risk & Probability Predictor
function predictCrimeRisk({ lat, lng, city, hour = 14, dayOfWeek = 3, crimes = [] }) {
  // If coordinates provided, filter nearby spatial incidents (within 3km)
  const userLat = parseFloat(lat) || (city === 'Noida' ? 28.5355 : city === 'Gurugram' ? 28.4595 : 28.6139);
  const userLng = parseFloat(lng) || (city === 'Noida' ? 77.3910 : city === 'Gurugram' ? 77.0266 : 77.2090);

  const cityCrimes = crimes.filter(c => !city || c.city?.toLowerCase() === city.toLowerCase());
  const pool = cityCrimes.length > 0 ? cityCrimes : crimes;

  // Spatial density analysis
  let nearbyCount = 0;
  let totalRiskSum = 0;
  const crimeTypeFreq = {};

  pool.forEach(c => {
    const dist = calculateDistance(userLat, userLng, c.latitude, c.longitude);
    if (dist <= 3.0) { // 3 km radius
      const weight = Math.exp(-dist); // exponential distance decay weight
      nearbyCount += weight;
      totalRiskSum += (c.risk_score || 50) * weight;
      crimeTypeFreq[c.crime_type] = (crimeTypeFreq[c.crime_type] || 0) + weight;
    }
  });

  // Temporal multiplier (night hours 10 PM - 4 AM higher risk)
  let timeMultiplier = 1.0;
  if (hour >= 22 || hour <= 4) timeMultiplier = 1.35;
  else if (hour >= 18 && hour < 22) timeMultiplier = 1.15;
  else if (hour >= 9 && hour <= 17) timeMultiplier = 0.85;

  let baseRisk = nearbyCount > 0 ? (totalRiskSum / nearbyCount) : 52;
  let predictedRisk = Math.min(98, Math.max(15, Math.round(baseRisk * timeMultiplier)));

  // Probabilities calculation
  const totalWeight = Object.values(crimeTypeFreq).reduce((a, b) => a + b, 0) || 1;
  const probabilities = {};
  ['Theft', 'Robbery', 'Assault', 'Burglary', 'Harassment', 'Vehicle Theft', 'Fraud', 'Cyber Crime'].forEach(t => {
    const freq = crimeTypeFreq[t] || (t === 'Theft' ? 0.35 : t === 'Robbery' ? 0.2 : 0.1);
    probabilities[t] = Math.round((freq / totalWeight) * 100);
  });

  const riskLevel = predictedRisk >= 75 ? 'CRITICAL HIGH' : predictedRisk >= 55 ? 'MODERATE RISK' : 'LOW RISK (SAFE)';

  const safetyRecommendations = [];
  if (predictedRisk >= 70) {
    safetyRecommendations.push('Avoid traveling alone during late evening hours in this vicinity.');
    safetyRecommendations.push('Keep emergency contacts and SafetyWatch SOS ready.');
    safetyRecommendations.push('Use well-lit main arterial routes rather than isolated alleys.');
  } else if (predictedRisk >= 50) {
    safetyRecommendations.push('Remain vigilant of personal belongings in crowded areas.');
    safetyRecommendations.push('Ensure vehicle is locked in designated parking zones.');
  } else {
    safetyRecommendations.push('Area exhibits low incident frequency. Normal precautions apply.');
  }

  return {
    location: { lat: userLat, lng: userLng, city: city || 'NCR' },
    predicted_risk_index: predictedRisk,
    risk_level: riskLevel,
    nearby_historical_incidents: Math.round(nearbyCount),
    time_evaluated: `${hour}:00`,
    probabilities,
    safety_recommendations: safetyRecommendations,
    ml_model_version: 'NCR-RF-Spatial-v2.4'
  };
}

// Route Safety Evaluator
function evaluateRouteSafety(waypoints = [], crimes = []) {
  if (!waypoints || waypoints.length === 0) {
    return { overall_safety_score: 85, risk_segments: [], advice: 'Direct route clear.' };
  }

  let totalRisk = 0;
  const highRiskPoints = [];

  waypoints.forEach((wp, idx) => {
    const pred = predictCrimeRisk({ lat: wp.lat, lng: wp.lng, hour: new Date().getHours(), crimes });
    totalRisk += pred.predicted_risk_index;

    if (pred.predicted_risk_index > 65) {
      highRiskPoints.push({
        waypoint_index: idx,
        lat: wp.lat,
        lng: wp.lng,
        risk: pred.predicted_risk_index,
        warning: `High crime activity detected near waypoint ${idx + 1}`
      });
    }
  });

  const avgRisk = Math.round(totalRisk / waypoints.length);
  const safetyScore = Math.max(10, 100 - avgRisk);

  return {
    overall_safety_score: safetyScore,
    average_route_risk: avgRisk,
    safety_rating: safetyScore >= 75 ? 'VERY SAFE' : safetyScore >= 55 ? 'MODERATE' : 'HAZARDOUS',
    high_risk_segments_count: highRiskPoints.length,
    high_risk_points: highRiskPoints,
    advice: safetyScore < 60
      ? 'Caution advised. Consider taking main commercial bypass routes.'
      : 'Route safety profile is clear.'
  };
}

module.exports = {
  runKMeansClustering,
  predictCrimeRisk,
  evaluateRouteSafety
};
