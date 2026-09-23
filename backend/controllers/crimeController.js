const { getCrimes } = require('../services/crimeDataService');

exports.getCrimes = (req, res) => {
  const { city = 'Delhi', type, severity, from, to, limit = 500 } = req.query;
  let crimes = getCrimes(city.trim(), parseInt(limit, 10) || 500);

  if (type && type !== 'all') {
    crimes = crimes.filter(c => (c.crime_type || c.type || '').toLowerCase() === type.toLowerCase());
  }
  if (severity) {
    crimes = crimes.filter(c => (c.severity || 3) >= parseInt(severity, 10));
  }
  if (from) {
    crimes = crimes.filter(c => c.date >= from);
  }
  if (to) {
    crimes = crimes.filter(c => c.date <= to);
  }

  // Normalize lat/lng/type fields for frontend consumption
  const normalized = crimes.map(c => ({
    ...c,
    type: c.crime_type || c.type || 'Theft',
    lat: c.latitude !== undefined ? c.latitude : c.lat,
    lng: c.longitude !== undefined ? c.longitude : c.lng
  }));

  res.json({ city, total: normalized.length, crimes: normalized });
};

exports.getHeatmap = (req, res) => {
  const city = (req.query.city || 'Delhi').trim();
  const crimes = getCrimes(city, 800);
  const heatmap = crimes.map(c => [
    c.latitude !== undefined ? c.latitude : c.lat,
    c.longitude !== undefined ? c.longitude : c.lng,
    (c.severity || 3) / 5
  ]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
  
  res.json({ city, points: heatmap });
};

exports.reportCrime = (req, res) => {
  const { type, lat, lng, description, severity, city } = req.body;
  if (!type || !lat || !lng) return res.status(400).json({ error: 'type, lat, lng required' });
  
  const report = {
    id: `report_${Date.now()}`,
    type,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    city: city || 'Delhi',
    description: description || 'User submitted incident report.',
    severity: parseInt(severity, 10) || 3,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    status: 'submitted',
  };
  
  res.json({ success: true, report });
};
