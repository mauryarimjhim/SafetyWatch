import { CITY_COORDS } from './constants';

/**
 * Generate realistic mock crime data for a city
 */
const CRIME_CONFIGS = {
  Theft:      { severityRange: [1, 3], frequency: 0.25, peakHours: [10, 14, 18, 22] },
  Assault:    { severityRange: [3, 5], frequency: 0.15, peakHours: [20, 22, 23, 1] },
  Robbery:    { severityRange: [3, 4], frequency: 0.15, peakHours: [21, 23, 0, 2] },
  Burglary:   { severityRange: [2, 4], frequency: 0.12, peakHours: [1, 2, 3, 4] },
  Vandalism:  { severityRange: [1, 3], frequency: 0.10, peakHours: [18, 20, 22, 23] },
  Harassment: { severityRange: [2, 4], frequency: 0.10, peakHours: [19, 21, 22, 23] },
  Fraud:      { severityRange: [2, 3], frequency: 0.08, peakHours: [10, 12, 14, 16] },
  Murder:     { severityRange: [5, 5], frequency: 0.05, peakHours: [23, 0, 1, 2] },
};

const AREA_NAMES = {
  Delhi: ['Connaught Place', 'Karol Bagh', 'Saket', 'Dwarka', 'Rohini', 'Chandni Chowk', 'Lajpat Nagar', 'Janakpuri', 'Pitampura', 'Nehru Place'],
  Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Colaba', 'Kurla', 'Borivali', 'Thane', 'Powai', 'Juhu', 'Lower Parel'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'MG Road', 'Electronic City', 'Jayanagar', 'HSR Layout', 'Marathahalli', 'Yelahanka', 'Malleswaram'],
  Kolkata: ['Salt Lake', 'Park Street', 'Howrah', 'New Town', 'Ballygunge', 'Behala', 'Tollygunge', 'Dum Dum', 'Gariahat', 'Sealdah'],
  Noida: ['Sector 18', 'Sector 62', 'Sector 137', 'Knowledge Park', 'Noida Extension', 'Sector 50', 'Sector 76', 'Film City', 'Sector 44', 'Sector 15A'],
  Lucknow: ['Hazratganj', 'Aminabad', 'Gomti Nagar', 'Alambagh', 'Charbagh', 'Indira Nagar', 'Aliganj', 'Mahanagar', 'Rajajipuram', 'Husainabad'],
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateCrimeData(city = 'Delhi', count = 200) {
  const coords = CITY_COORDS[city] || CITY_COORDS.Delhi;
  const areas = AREA_NAMES[city] || AREA_NAMES.Delhi;
  const rand = seededRandom(city.length * 1000 + count);

  const crimes = [];
  const types = Object.keys(CRIME_CONFIGS);

  for (let i = 0; i < count; i++) {
    // Pick type based on frequency distribution
    let r = rand();
    let cumulative = 0;
    let type = 'Theft';
    for (const [t, config] of Object.entries(CRIME_CONFIGS)) {
      cumulative += config.frequency;
      if (r <= cumulative) { type = t; break; }
    }

    const config = CRIME_CONFIGS[type];
    const severity = config.severityRange[0] + Math.floor(rand() * (config.severityRange[1] - config.severityRange[0] + 1));

    // Generate coordinates around city center with some spread
    const lat = coords.lat + (rand() - 0.5) * 0.15;
    const lng = coords.lng + (rand() - 0.5) * 0.15;

    // Generate date within last 12 months
    const daysAgo = Math.floor(rand() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    // Generate hour biased toward peak hours
    const isPeak = rand() < 0.6;
    const hour = isPeak
      ? config.peakHours[Math.floor(rand() * config.peakHours.length)]
      : Math.floor(rand() * 24);

    crimes.push({
      id: `crime_${city}_${i}`,
      type,
      lat,
      lng,
      severity,
      date: date.toISOString().split('T')[0],
      time: `${hour.toString().padStart(2, '0')}:${Math.floor(rand() * 60).toString().padStart(2, '0')}`,
      hour,
      area: areas[Math.floor(rand() * areas.length)],
      description: `${type} incident reported in ${areas[Math.floor(rand() * areas.length)]}`,
      month: date.getMonth(),
      dayOfWeek: date.getDay(),
    });
  }

  return crimes;
}

export function getMonthlyTrend(crimes) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyCounts = new Array(12).fill(0);
  crimes.forEach(c => { monthlyCounts[c.month]++; });
  return months.map((month, i) => ({ month, crimes: monthlyCounts[i] }));
}

export function getHourlyCounts(crimes) {
  const counts = new Array(24).fill(0);
  crimes.forEach(c => { counts[c.hour]++; });
  return counts;
}

export function getCrimeTypeDistribution(crimes) {
  const dist = {};
  crimes.forEach(c => { dist[c.type] = (dist[c.type] || 0) + 1; });
  return Object.entries(dist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getAreaStats(crimes) {
  const areas = {};
  crimes.forEach(c => {
    if (!areas[c.area]) areas[c.area] = { area: c.area, crimes: 0, totalSeverity: 0 };
    areas[c.area].crimes++;
    areas[c.area].totalSeverity += c.severity;
  });
  return Object.values(areas)
    .map(a => ({ ...a, avgSeverity: Math.round((a.totalSeverity / a.crimes) * 10) / 10 }))
    .sort((a, b) => b.crimes - a.crimes);
}

export function getHeatmapData(crimes) {
  return crimes.map(c => [c.lat, c.lng, c.severity / 5]);
}
