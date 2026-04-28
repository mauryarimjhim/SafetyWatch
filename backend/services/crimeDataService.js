/**
 * Crime data service — generates rich mock data for Indian cities
 */

const CRIME_TYPES = ['Theft', 'Assault', 'Robbery', 'Burglary', 'Vandalism', 'Harassment', 'Fraud', 'Murder'];
const SEVERITY_WEIGHTS = { Theft: [1,3], Assault: [3,5], Robbery: [3,4], Burglary: [2,4], Vandalism: [1,3], Harassment: [2,4], Fraud: [2,3], Murder: [5,5] };
const FREQUENCY = { Theft: 0.25, Assault: 0.15, Robbery: 0.15, Burglary: 0.12, Vandalism: 0.10, Harassment: 0.10, Fraud: 0.08, Murder: 0.05 };
const PEAK_HOURS = { Theft: [10,14,18,22], Assault: [20,22,23,1], Robbery: [21,23,0,2], Burglary: [1,2,3,4], Vandalism: [18,20,22,23], Harassment: [19,21,22,23], Fraud: [10,12,14,16], Murder: [23,0,1,2] };

const CITIES = {
  Delhi: { lat: 28.6139, lng: 77.2090, areas: ['Connaught Place','Karol Bagh','Saket','Dwarka','Rohini','Chandni Chowk','Lajpat Nagar','Janakpuri','Pitampura','Nehru Place'] },
  Mumbai: { lat: 19.0760, lng: 72.8777, areas: ['Andheri','Bandra','Dadar','Colaba','Kurla','Borivali','Thane','Powai','Juhu','Lower Parel'] },
  Bangalore: { lat: 12.9716, lng: 77.5946, areas: ['Koramangala','Indiranagar','Whitefield','MG Road','Electronic City','Jayanagar','HSR Layout','Marathahalli','Yelahanka','Malleswaram'] },
  Kolkata: { lat: 22.5726, lng: 88.3639, areas: ['Salt Lake','Park Street','Howrah','New Town','Ballygunge','Behala','Tollygunge','Dum Dum','Gariahat','Sealdah'] },
  Chennai: { lat: 13.0827, lng: 80.2707, areas: ['T Nagar','Adyar','Anna Nagar','Velachery','Tambaram','Mylapore','Nungambakkam','Porur','Chrompet','Guindy'] },
  Hyderabad: { lat: 17.3850, lng: 78.4867, areas: ['HITEC City','Banjara Hills','Gachibowli','Secunderabad','Jubilee Hills','Kukatpally','Madhapur','Ameerpet','Begumpet','LB Nagar'] },
  Noida: { lat: 28.5355, lng: 77.3910, areas: ['Sector 18','Sector 62','Sector 137','Knowledge Park','Noida Extension','Sector 50','Sector 76','Film City','Sector 44','Sector 15A'] },
  Lucknow: { lat: 26.8467, lng: 80.9462, areas: ['Hazratganj','Aminabad','Gomti Nagar','Alambagh','Charbagh','Indira Nagar','Aliganj','Mahanagar','Rajajipuram','Husainabad'] },
  Pune: { lat: 18.5204, lng: 73.8567, areas: ['Koregaon Park','Hinjewadi','Kothrud','Hadapsar','Baner','Wakad','Viman Nagar','Pimpri','Deccan','Camp'] },
  Jaipur: { lat: 26.9124, lng: 75.7873, areas: ['MI Road','Malviya Nagar','Mansarovar','C Scheme','Vaishali Nagar','Raja Park','Tonk Road','Jagatpura','Sanganer','Amer'] },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, areas: ['SG Highway','Satellite','Navrangpura','CG Road','Bodakdev','Prahlad Nagar','Maninagar','Bopal','Thaltej','Ellis Bridge'] },
};

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function generateCrimes(city, count = 300) {
  const c = CITIES[city] || CITIES.Delhi;
  const rand = seeded(city.length * 1000 + count);
  const crimes = [];

  for (let i = 0; i < count; i++) {
    let r = rand(), cum = 0, type = 'Theft';
    for (const [t, f] of Object.entries(FREQUENCY)) { cum += f; if (r <= cum) { type = t; break; } }
    const sw = SEVERITY_WEIGHTS[type];
    const severity = sw[0] + Math.floor(rand() * (sw[1] - sw[0] + 1));
    const daysAgo = Math.floor(rand() * 365);
    const date = new Date(); date.setDate(date.getDate() - daysAgo);
    const isPeak = rand() < 0.6;
    const ph = PEAK_HOURS[type];
    const hour = isPeak ? ph[Math.floor(rand() * ph.length)] : Math.floor(rand() * 24);

    crimes.push({
      id: `${city}_${i}`,
      type, severity,
      lat: c.lat + (rand() - 0.5) * 0.15,
      lng: c.lng + (rand() - 0.5) * 0.15,
      date: date.toISOString().split('T')[0],
      time: `${String(hour).padStart(2,'0')}:${String(Math.floor(rand()*60)).padStart(2,'0')}`,
      hour,
      area: c.areas[Math.floor(rand() * c.areas.length)],
      month: date.getMonth(),
    });
  }
  return crimes;
}

// Cache
const cache = {};
function getCrimes(city, count = 300) {
  const key = `${city}_${count}`;
  if (!cache[key]) cache[key] = generateCrimes(city, count);
  return cache[key];
}

module.exports = { getCrimes, CITIES, CRIME_TYPES };
