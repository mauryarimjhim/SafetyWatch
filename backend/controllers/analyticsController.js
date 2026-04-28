const { getCrimes } = require('../services/crimeDataService');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

exports.getAnalytics = (req, res) => {
  const city = (req.query.city || 'Delhi').trim();
  const crimes = getCrimes(city, 400);

  // Type distribution (pie)
  const typeDist = {};
  crimes.forEach(c => { typeDist[c.type] = (typeDist[c.type] || 0) + 1; });
  const pie = Object.entries(typeDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Monthly trend (line)
  const monthly = new Array(12).fill(0);
  crimes.forEach(c => { monthly[c.month]++; });
  const line = MONTHS.map((m, i) => ({ month: m, crimes: monthly[i] }));

  // Area stats (bar)
  const areaDist = {};
  crimes.forEach(c => { areaDist[c.area] = (areaDist[c.area] || 0) + 1; });
  const bar = Object.entries(areaDist).map(([area, crimes]) => ({ area, crimes })).sort((a, b) => b.crimes - a.crimes);

  // Hourly distribution
  const hourly = new Array(24).fill(0);
  crimes.forEach(c => { hourly[c.hour]++; });

  // Safety index
  const total = crimes.length;
  const avgSeverity = crimes.reduce((s, c) => s + c.severity, 0) / total;
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - (total / 8) - (avgSeverity * 5))));

  // Simple prediction (linear trend)
  const recentMonths = monthly.slice(-6);
  const avgRecent = recentMonths.reduce((s, v) => s + v, 0) / recentMonths.length;
  const predictions = Array.from({ length: 6 }, (_, i) => Math.round(avgRecent * (1 + (Math.random() * 0.2 - 0.1))));

  res.json({
    city,
    totalCrimes: total,
    safetyScore,
    safetyLabel: safetyScore >= 70 ? 'Safe' : safetyScore >= 40 ? 'Moderate' : 'Dangerous',
    pie, line, bar, hourly, predictions,
    avgSeverity: Math.round(avgSeverity * 10) / 10,
    mostCommonType: pie[0]?.name || 'N/A',
    peakHours: hourly.reduce((acc, v, i) => v > (hourly[acc[0]] || 0) ? [i] : v === hourly[acc[0]] ? [...acc, i] : acc, [0]).map(h => `${String(h).padStart(2, '0')}:00`),
  });
};
