const { getCrimes } = require('../services/crimeDataService');

exports.getCrimes = (req, res) => {
  const { city = 'Delhi', type, severity, from, to } = req.query;
  let crimes = getCrimes(city.trim(), 300);

  if (type && type !== 'all') crimes = crimes.filter(c => c.type === type);
  if (severity) crimes = crimes.filter(c => c.severity >= parseInt(severity));
  if (from) crimes = crimes.filter(c => c.date >= from);
  if (to) crimes = crimes.filter(c => c.date <= to);

  res.json({ city, total: crimes.length, crimes });
};

exports.getHeatmap = (req, res) => {
  const city = (req.query.city || 'Delhi').trim();
  const crimes = getCrimes(city, 300);
  const heatmap = crimes.map(c => [c.lat, c.lng, c.severity / 5]);
  res.json({ city, points: heatmap });
};

exports.reportCrime = (req, res) => {
  const { type, lat, lng, description, severity } = req.body;
  if (!type || !lat || !lng) return res.status(400).json({ error: 'type, lat, lng required' });
  const report = {
    id: `report_${Date.now()}`,
    type, lat, lng, description, severity: severity || 3,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    status: 'submitted',
  };
  res.json({ success: true, report });
};
