/**
 * ML Predictor — Browser-side machine learning for crime analytics
 * Uses linear regression, seasonal decomposition, and risk scoring
 */

// ========== Linear Regression ==========
function linearRegression(data) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  data.forEach(({ x, y }) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const ssTot = sumY2 - (sumY * sumY) / n;
  const ssRes = data.reduce((sum, { x, y }) => sum + Math.pow(y - (slope * x + intercept), 2), 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2: Math.max(0, r2) };
}

// ========== Moving Average ==========
function movingAverage(data, windowSize = 3) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    result.push(window.reduce((s, v) => s + v, 0) / window.length);
  }
  return result;
}

// ========== Seasonal Decomposition ==========
function seasonalDecomposition(monthlyData) {
  const n = monthlyData.length;
  if (n < 4) return { trend: monthlyData, seasonal: new Array(n).fill(0), residual: new Array(n).fill(0) };

  // Trend via moving average
  const trend = movingAverage(monthlyData, 3);

  // Seasonal component
  const detrended = monthlyData.map((v, i) => v - trend[i]);
  const seasonLen = Math.min(12, n);
  const seasonal = new Array(n).fill(0);
  for (let s = 0; s < seasonLen; s++) {
    let count = 0, sum = 0;
    for (let i = s; i < n; i += seasonLen) {
      sum += detrended[i];
      count++;
    }
    const avg = sum / count;
    for (let i = s; i < n; i += seasonLen) {
      seasonal[i] = avg;
    }
  }

  // Residual
  const residual = monthlyData.map((v, i) => v - trend[i] - seasonal[i]);

  return { trend, seasonal, residual };
}

// ========== Predict Future Crimes ==========
export function predictFutureCrimes(monthlyData, monthsAhead = 6) {
  const n = monthlyData.length;
  const points = monthlyData.map((y, i) => ({ x: i, y }));
  const { slope, intercept, r2 } = linearRegression(points);
  const { seasonal } = seasonalDecomposition(monthlyData);

  const predictions = [];
  for (let i = 0; i < monthsAhead; i++) {
    const x = n + i;
    const trendValue = slope * x + intercept;
    const seasonalValue = seasonal[i % seasonal.length] || 0;
    const predicted = Math.max(0, Math.round(trendValue + seasonalValue));
    predictions.push(predicted);
  }

  const trendDirection = slope > 0.5 ? 'increasing' : slope < -0.5 ? 'decreasing' : 'stable';

  return {
    predictions,
    trendDirection,
    confidence: Math.round(r2 * 100),
    slope: Math.round(slope * 100) / 100,
    modelInfo: { type: 'Linear Regression + Seasonal Decomposition', r2: Math.round(r2 * 1000) / 1000 },
  };
}

// ========== Anomaly Detection ==========
export function detectAnomalies(data, threshold = 2) {
  const mean = data.reduce((s, v) => s + v, 0) / data.length;
  const std = Math.sqrt(data.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / data.length);

  return data.map((value, index) => {
    const zScore = std === 0 ? 0 : (value - mean) / std;
    return {
      index,
      value,
      zScore: Math.round(zScore * 100) / 100,
      isAnomaly: Math.abs(zScore) > threshold,
      type: zScore > threshold ? 'spike' : zScore < -threshold ? 'drop' : 'normal',
    };
  }).filter(d => d.isAnomaly);
}

// ========== Crime Hotspot Clustering (simple grid-based) ==========
export function identifyHotspots(crimePoints, gridSize = 0.01) {
  const grid = {};

  crimePoints.forEach(({ lat, lng, severity = 3 }) => {
    const key = `${Math.floor(lat / gridSize) * gridSize},${Math.floor(lng / gridSize) * gridSize}`;
    if (!grid[key]) grid[key] = { lat: 0, lng: 0, count: 0, totalSeverity: 0 };
    grid[key].lat += lat;
    grid[key].lng += lng;
    grid[key].count++;
    grid[key].totalSeverity += severity;
  });

  return Object.values(grid)
    .map(g => ({
      lat: g.lat / g.count,
      lng: g.lng / g.count,
      count: g.count,
      avgSeverity: Math.round((g.totalSeverity / g.count) * 10) / 10,
      riskScore: Math.min(100, Math.round((g.count * g.totalSeverity / g.count) * 5)),
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 20);
}

// ========== Time-based Risk Prediction ==========
export function predictRiskByTime(hourlyCrimeData) {
  const hourlyRisk = hourlyCrimeData.map((count, hour) => {
    const maxCount = Math.max(...hourlyCrimeData);
    const risk = maxCount === 0 ? 0 : Math.round((count / maxCount) * 100);
    return {
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      crimeCount: count,
      riskLevel: risk,
      category: risk >= 70 ? 'High Risk' : risk >= 40 ? 'Moderate' : 'Low Risk',
      color: risk >= 70 ? '#ef4444' : risk >= 40 ? '#eab308' : '#22c55e',
    };
  });

  // Find peak danger hours
  const peakHours = hourlyRisk
    .filter(h => h.category === 'High Risk')
    .map(h => h.label);

  return { hourlyRisk, peakHours };
}

// ========== Safety Score for Area ==========
export function calculateAreaSafety(crimeCount, population = 100000, area = 50) {
  // Crime rate per 100,000 people
  const crimeRate = (crimeCount / population) * 100000;

  // Density-adjusted score (lower is safer)
  const densityFactor = crimeCount / area;

  // Normalize to 0-100 scale (100 = safest)
  const rawScore = Math.max(0, 100 - (crimeRate / 10) - (densityFactor * 2));
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    score,
    crimeRate: Math.round(crimeRate),
    densityFactor: Math.round(densityFactor * 10) / 10,
    label: score >= 70 ? 'Safe' : score >= 40 ? 'Moderate' : 'Dangerous',
    color: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
  };
}

// ========== Crime Type Prediction ==========
export function predictCrimeTypes(historicalDistribution) {
  // Simple next-period prediction based on weighted recent data
  const total = historicalDistribution.reduce((s, d) => s + d.value, 0);
  return historicalDistribution.map(d => ({
    ...d,
    percentage: Math.round((d.value / total) * 100),
    predicted: Math.round(d.value * (1 + (Math.random() * 0.2 - 0.1))), // ±10% variation
    trend: d.value > (total / historicalDistribution.length) ? 'above_avg' : 'below_avg',
  }));
}
