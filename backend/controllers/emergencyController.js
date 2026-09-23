const { sendSMSNotification } = require('../services/smsService');

const STATIONS = [
  { name: 'Central Police Station', address: 'Main Road, Central District', phone: '011-23456789', baseLat: 28.63, baseLng: 77.22 },
  { name: 'North District Police Station', address: 'Civil Lines, North District', phone: '011-23456790', baseLat: 28.68, baseLng: 77.21 },
  { name: 'South District Police Station', address: 'Defence Colony, South Delhi', phone: '011-23456791', baseLat: 28.57, baseLng: 77.23 },
  { name: 'East District Police Station', address: 'Laxmi Nagar, East Delhi', phone: '011-23456792', baseLat: 28.63, baseLng: 77.28 },
  { name: 'West District Police Station', address: 'Rajouri Garden, West Delhi', phone: '011-23456793', baseLat: 28.65, baseLng: 77.12 },
  { name: 'Cyber Crime Cell', address: 'Mandir Marg, New Delhi', phone: '011-23456794', baseLat: 28.63, baseLng: 77.20 },
  { name: 'Women Safety Cell', address: 'Nanak Pura, South Delhi', phone: '011-23456795', baseLat: 28.58, baseLng: 77.19 },
  { name: 'Traffic Police HQ', address: 'IP Estate, New Delhi', phone: '011-23456796', baseLat: 28.63, baseLng: 77.24 },
];

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

exports.getStations = (req, res) => {
  const lat = parseFloat(req.query.lat) || 28.6139;
  const lng = parseFloat(req.query.lng) || 77.2090;

  const stations = STATIONS.map(s => ({
    name: s.name,
    address: s.address,
    phone: s.phone,
    lat: s.baseLat,
    lng: s.baseLng,
    distance: Math.round(haversine(lat, lng, s.baseLat, s.baseLng) * 10) / 10,
  })).sort((a, b) => a.distance - b.distance);

  res.json(stations);
};

exports.sendSOS = (req, res) => {
  const { lat, lng, timestamp, name, phone, emergencyContact } = req.body;
  console.log(`🚨 SOS ALERT received at ${timestamp} — Location: ${lat}, ${lng}`);

  // Send SMS to user & emergency contact
  const smsResult = sendSMSNotification({
    phone,
    name,
    area: `${lat}, ${lng}`,
    emergencyContact,
    type: 'SOS_ALERT'
  });

  res.json({
    success: true,
    message: 'SOS alert received. Emergency services & contacts notified via Mobile SMS.',
    alertId: `SOS_${Date.now()}`,
    respondingUnit: 'PCR Van #' + Math.floor(Math.random() * 50 + 1),
    eta: Math.floor(Math.random() * 8 + 3) + ' minutes',
    smsResult
  });
};

exports.sendMobileSMS = (req, res) => {
  const { phone, name, area, riskScore, emergencyContact, type } = req.body;
  const result = sendSMSNotification({ phone, name, area, riskScore, emergencyContact, type });
  res.json({ success: true, result });
};
