const fs = require('fs');
const path = require('path');
let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (e) {
  console.log('Mongoose not found, proceeding with JSON file generation.');
}

// NCR Regional Centers & Stations mapping
const NCR_CITIES = {
  'Delhi': {
    lat: 28.6139, lng: 77.2090,
    latMin: 28.50, latMax: 28.88, lngMin: 76.90, lngMax: 77.34,
    areas: ['Connaught Place', 'Karol Bagh', 'Saket', 'Dwarka', 'Rohini', 'Chandni Chowk', 'Lajpat Nagar', 'Janakpuri', 'Pitampura', 'Nehru Place', 'Hauz Khas', 'Vasant Kunj', 'Model Town', 'Punjabi Bagh', 'Mayur Vihar']
  },
  'Noida': {
    lat: 28.5355, lng: 77.3910,
    latMin: 28.48, latMax: 28.62, lngMin: 77.30, lngMax: 77.48,
    areas: ['Sector 18', 'Sector 62', 'Sector 137', 'Knowledge Park', 'Noida Extension', 'Sector 50', 'Sector 76', 'Film City', 'Sector 44', 'Sector 15A', 'Sector 128', 'Sector 39', 'Botanical Garden', 'Sector 71']
  },
  'Gurugram': {
    lat: 28.4595, lng: 77.0266,
    latMin: 28.35, latMax: 28.54, lngMin: 76.90, lngMax: 77.15,
    areas: ['Cyber City', 'MG Road', 'DLF Phase 3', 'Golf Course Road', 'Sohna Road', 'Sector 29', 'Sector 56', 'Udyog Vihar', 'Huda City Centre', 'Palam Vihar', 'Manesar', 'Sector 14', 'Golf Course Extension']
  },
  'Ghaziabad': {
    lat: 28.6692, lng: 77.4538,
    latMin: 28.60, latMax: 28.75, lngMin: 77.34, lngMax: 77.52,
    areas: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Raj Nagar', 'Crossings Republik', 'Kavi Nagar', 'Sahibabad', 'Mohan Nagar', 'Vijay Nagar', 'Surya Nagar', 'Loni Road', 'Kaushambi']
  },
  'Faridabad': {
    lat: 28.4089, lng: 77.3178,
    latMin: 28.28, latMax: 28.48, lngMin: 77.24, lngMax: 77.40,
    areas: ['NIT Faridabad', 'Sector 15', 'Sector 16', 'Greater Faridabad', 'Ballabhgarh', 'Old Faridabad', 'Surajkund', 'Green Field', 'Sector 21', 'Sector 31', 'Sector 37', 'Mathura Road']
  },
  'Greater Noida': {
    lat: 28.4744, lng: 77.5040,
    latMin: 28.40, latMax: 28.55, lngMin: 77.45, lngMax: 77.60,
    areas: ['Pari Chowk', 'Omega 1', 'Alpha 2', 'Delta 1', 'Knowledge Park 3', 'Tech Zone 4', 'Greater Noida West', 'Surajpur', 'Ecotech', 'Zeta 1', 'Gamma 2', 'Jaypee Greens']
  }
};

const CITY_NAMES = Object.keys(NCR_CITIES);

// Map raw crime types to standard categories
const CRIME_TYPE_MAP = {
  'theft': 'Theft',
  'burglary': 'Burglary',
  'robbery': 'Robbery',
  'assault': 'Assault',
  'assualt murders': 'Assault',
  'murder': 'Murder',
  'vandalism': 'Vandalism',
  'harassment': 'Harassment',
  'sexual harassement': 'Harassment',
  'rape': 'Assault',
  'gangrape': 'Assault',
  'fraud': 'Fraud',
  'cyber crime': 'Cyber Crime',
  'vehicle theft': 'Vehicle Theft'
};

const BASE_RISK = {
  'Murder': 95,
  'Assault': 80,
  'Robbery': 85,
  'Burglary': 70,
  'Theft': 55,
  'Vehicle Theft': 60,
  'Harassment': 65,
  'Vandalism': 50,
  'Fraud': 45,
  'Cyber Crime': 40
};

function normalizeCrimeType(rawType) {
  if (!rawType) return 'Theft';
  const clean = rawType.toString().trim().toLowerCase();
  for (const [key, mapped] of Object.entries(CRIME_TYPE_MAP)) {
    if (clean.includes(key)) return mapped;
  }
  return 'Theft';
}

function getCityFromLocation(locationStr, defaultIndex) {
  if (!locationStr) return CITY_NAMES[defaultIndex % CITY_NAMES.length];
  const str = locationStr.toString().toLowerCase();
  if (str.includes('noida') && !str.includes('greater')) return 'Noida';
  if (str.includes('greater noida')) return 'Greater Noida';
  if (str.includes('gurgaon') || str.includes('gurugram') || str.includes('cyber') || str.includes('dlf')) return 'Gurugram';
  if (str.includes('ghaziabad') || str.includes('indirapuram') || str.includes('vaishali')) return 'Ghaziabad';
  if (str.includes('faridabad') || str.includes('nit') || str.includes('surajkund')) return 'Faridabad';
  if (str.includes('delhi') || str.includes('colony') || str.includes('nagar') || str.includes('place')) return 'Delhi';
  
  // Deterministic fallback based on hash of location name
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return CITY_NAMES[hash % CITY_NAMES.length];
}

function getRandomCoordinates(cityName, seedIndex) {
  const c = NCR_CITIES[cityName] || NCR_CITIES.Delhi;
  // Pseudorandom pseudo-scatter based on seed
  const r1 = ((seedIndex * 9301 + 49297) % 233280) / 233280;
  const r2 = ((seedIndex * 49297 + 9301) % 233280) / 233280;
  const lat = c.latMin + r1 * (c.latMax - c.latMin);
  const lng = c.lngMin + r2 * (c.lngMax - c.lngMin);
  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
}

function combineDatasets() {
  console.log('🚀 Starting NCR Crime Dataset Unification...');
  const combinedCrimes = [];
  let recordCounter = 1;

  const datasetDir = __dirname;

  // 1. Process dataset 11 (crime_dataset11.json)
  const path11 = path.join(datasetDir, 'crime_dataset11.json');
  if (fs.existsSync(path11)) {
    console.log('📦 Processing crime_dataset11.json...');
    const d11 = JSON.parse(fs.readFileSync(path11, 'utf8'));
    d11.forEach((item, idx) => {
      const crimeType = normalizeCrimeType(item.crime_type);
      const city = CITY_NAMES[idx % CITY_NAMES.length];
      const cityInfo = NCR_CITIES[city];
      const area = cityInfo.areas[idx % cityInfo.areas.length];
      
      let lat = parseFloat(item.latitude);
      let lng = parseFloat(item.longitude);
      // Validate bounds for NCR
      if (isNaN(lat) || lat < 28.0 || lat > 29.0 || isNaN(lng) || lng < 76.5 || lng > 78.0) {
        const coords = getRandomCoordinates(city, idx);
        lat = coords.lat;
        lng = coords.lng;
      }

      const dateStr = item.occurred ? item.occurred.split(' ')[0] : '2022-05-10';
      const timeStr = item.occurred && item.occurred.split(' ')[1] ? item.occurred.split(' ')[1] : '14:30';
      const hour = parseInt(timeStr.split(':')[0], 10) || 12;

      combinedCrimes.push({
        id: `NCR_${recordCounter++}`,
        city,
        area,
        station: `${area} PS`,
        crime_type: crimeType,
        latitude: lat,
        longitude: lng,
        date: dateStr,
        time: timeStr,
        hour,
        month: Math.floor(idx % 12) + 1,
        year: 2020 + (idx % 5),
        severity: crimeType === 'Murder' || crimeType === 'Assault' ? 5 : crimeType === 'Robbery' ? 4 : 3,
        risk_score: BASE_RISK[crimeType] || 50,
        status: item.disposition || 'Closed',
        description: `Incident of ${crimeType} reported in ${area}, ${city}.`
      });
    });
    console.log(`  └─ Added ${d11.length} records from dataset 11`);
  }

  // 2. Process dataset 2 (crime_dataset2.json)
  const path2 = path.join(datasetDir, 'crime_dataset2.json');
  if (fs.existsSync(path2)) {
    console.log('📦 Processing crime_dataset2.json...');
    const d2 = JSON.parse(fs.readFileSync(path2, 'utf8'));
    d2.forEach((row, idx) => {
      if (!Array.isArray(row) || row.length < 5) return;
      const [stationName, rawCrime, time, date, status, code, desc] = row;
      const crimeType = normalizeCrimeType(rawCrime);
      const city = getCityFromLocation(stationName, idx);
      const cityInfo = NCR_CITIES[city];
      const area = stationName || cityInfo.areas[idx % cityInfo.areas.length];
      const coords = getRandomCoordinates(city, idx + 5000);
      const hour = time ? parseInt(time.split(':')[0], 10) || 12 : 12;

      combinedCrimes.push({
        id: `NCR_${recordCounter++}`,
        city,
        area,
        station: `${area} PS`,
        crime_type: crimeType,
        latitude: coords.lat,
        longitude: coords.lng,
        date: date || '2021-08-15',
        time: time || '18:00',
        hour,
        month: Math.floor(idx % 12) + 1,
        year: 2021 + (idx % 4),
        severity: crimeType === 'Murder' ? 5 : crimeType === 'Robbery' ? 4 : 3,
        risk_score: BASE_RISK[crimeType] || 55,
        status: status || 'Under Investigation',
        description: desc || `Reported ${crimeType} case under code ${code || 'C-100'}.`
      });
    });
    console.log(`  └─ Added ${d2.length} records from dataset 2`);
  }

  // 3. Process dataset 3 (crime_dataset3.json)
  const path3 = path.join(datasetDir, 'crime_dataset3.json');
  if (fs.existsSync(path3)) {
    console.log('📦 Processing crime_dataset3.json...');
    const d3 = JSON.parse(fs.readFileSync(path3, 'utf8'));
    d3.forEach((row, idx) => {
      if (!Array.isArray(row) || row.length < 5) return;
      const [stationName, rawCrime, time, date, status, code, desc] = row;
      const crimeType = normalizeCrimeType(rawCrime);
      const city = getCityFromLocation(stationName, idx + 100);
      const cityInfo = NCR_CITIES[city];
      const area = stationName || cityInfo.areas[idx % cityInfo.areas.length];
      const coords = getRandomCoordinates(city, idx + 10000);
      const hour = time ? parseInt(time.split(':')[0], 10) || 12 : 12;

      combinedCrimes.push({
        id: `NCR_${recordCounter++}`,
        city,
        area,
        station: `${area} PS`,
        crime_type: crimeType,
        latitude: coords.lat,
        longitude: coords.lng,
        date: date || '2022-03-20',
        time: time || '20:00',
        hour,
        month: Math.floor(idx % 12) + 1,
        year: 2022 + (idx % 3),
        severity: crimeType === 'Murder' ? 5 : 3,
        risk_score: BASE_RISK[crimeType] || 50,
        status: status || 'Closed',
        description: desc || `Crime incident (${crimeType}) registered at ${area}.`
      });
    });
    console.log(`  └─ Added ${d3.length} records from dataset 3`);
  }

  // 4. Process dataset 4 (crime_dataset4.csv)
  const path4 = path.join(datasetDir, 'crime_dataset4.csv');
  if (fs.existsSync(path4)) {
    console.log('📦 Processing crime_dataset4.csv...');
    const content = fs.readFileSync(path4, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length < 5) return;
      const [location, rawCrime, time, date, status, caseNo, comments] = parts.map(p => p.trim());
      const crimeType = normalizeCrimeType(rawCrime);
      const city = getCityFromLocation(location, idx + 200);
      const cityInfo = NCR_CITIES[city];
      const area = location || cityInfo.areas[idx % cityInfo.areas.length];
      const coords = getRandomCoordinates(city, idx + 15000);
      const hour = time ? parseInt(time.split(':')[0], 10) || 14 : 14;

      combinedCrimes.push({
        id: `NCR_${recordCounter++}`,
        city,
        area,
        station: `${area} PS`,
        crime_type: crimeType,
        latitude: coords.lat,
        longitude: coords.lng,
        date: date || '2021-11-05',
        time: time || '15:30',
        hour,
        month: Math.floor(idx % 12) + 1,
        year: 2021 + (idx % 4),
        severity: crimeType === 'Murder' ? 5 : 3,
        risk_score: BASE_RISK[crimeType] || 60,
        status: status || 'Under Investigation',
        description: comments || `Case ${caseNo || 'NCR-889'} filed at ${area}.`
      });
    });
    console.log(`  └─ Processed ${lines.length - 1} records from dataset 4`);
  }

  // 5. Process dataset 5 (crime_dataset5.csv) - station aggregates
  const path5 = path.join(datasetDir, 'crime_dataset5.csv');
  if (fs.existsSync(path5)) {
    console.log('📦 Processing crime_dataset5.csv (Station level aggregates)...');
    const content = fs.readFileSync(path5, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    let synthCount = 0;
    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length < 12) return;
      const stationName = parts[0].trim();
      const murder = parseInt(parts[1], 10) || 0;
      const rape = parseInt(parts[2], 10) || 0;
      const gangrape = parseInt(parts[3], 10) || 0;
      const robbery = parseInt(parts[4], 10) || 0;
      const theft = parseInt(parts[5], 10) || 0;
      const assault = parseInt(parts[6], 10) || 0;
      const harassment = parseInt(parts[7], 10) || 0;
      const lng = parseFloat(parts[10]) || 77.2;
      const lat = parseFloat(parts[11]) || 28.6;

      const city = getCityFromLocation(stationName, idx);
      const stationCategories = [
        { type: 'Murder', count: murder },
        { type: 'Assault', count: rape + gangrape + assault },
        { type: 'Robbery', count: robbery },
        { type: 'Theft', count: theft },
        { type: 'Harassment', count: harassment }
      ];

      stationCategories.forEach(cat => {
        // Generate up to 5 representative incident samples per station category
        const sampleCount = Math.min(cat.count, 5);
        for (let i = 0; i < sampleCount; i++) {
          const jitterLat = lat + (Math.random() - 0.5) * 0.04;
          const jitterLng = lng + (Math.random() - 0.5) * 0.04;
          const hour = Math.floor(Math.random() * 24);
          synthCount++;

          combinedCrimes.push({
            id: `NCR_${recordCounter++}`,
            city,
            area: stationName,
            station: `${stationName} PS`,
            crime_type: cat.type,
            latitude: parseFloat(jitterLat.toFixed(6)),
            longitude: parseFloat(jitterLng.toFixed(6)),
            date: '2023-04-12',
            time: `${String(hour).padStart(2, '0')}:15`,
            hour,
            month: (i % 12) + 1,
            year: 2023,
            severity: cat.type === 'Murder' ? 5 : cat.type === 'Assault' ? 4 : 3,
            risk_score: BASE_RISK[cat.type] || 50,
            status: 'Closed',
            description: `Historical aggregate case record at ${stationName}.`
          });
        }
      });
    });
    console.log(`  └─ Generated ${synthCount} crime entries from dataset 5 station stats`);
  }

  console.log(`\n🎉 Total Combined NCR Crime Records: ${combinedCrimes.length}`);

  // Summary per city
  const cityCounts = {};
  CITY_NAMES.forEach(c => cityCounts[c] = 0);
  combinedCrimes.forEach(c => cityCounts[c.city] = (cityCounts[c.city] || 0) + 1);
  console.log('\n📊 Records Distribution across NCR Cities:');
  console.table(cityCounts);

  // Write to JSON outputs
  const outputDatasetPath = path.join(datasetDir, 'combined_ncr_dataset.json');
  const backendDataDir = path.join(__dirname, '../backend/data');
  if (!fs.existsSync(backendDataDir)) {
    fs.mkdirSync(backendDataDir, { recursive: true });
  }
  const backendDatasetPath = path.join(backendDataDir, 'combined_ncr_dataset.json');

  fs.writeFileSync(outputDatasetPath, JSON.stringify(combinedCrimes, null, 2));
  fs.writeFileSync(backendDatasetPath, JSON.stringify(combinedCrimes, null, 2));
  console.log(`\n✅ Saved combined dataset to:`);
  console.log(`   - ${outputDatasetPath}`);
  console.log(`   - ${backendDatasetPath}`);

  // Seed MongoDB if available
  if (mongoose) {
    seedMongo(combinedCrimes).catch(err => {
      console.log('ℹ️ MongoDB seed skipped or offline. Local JSON database will be used automatically by backend service.');
    });
  }
}

async function seedMongo(crimes) {
  try {
    console.log('\n🔌 Attempting connection to MongoDB (mongodb://127.0.0.1:27017/safetywatch)...');
    await mongoose.connect('mongodb://127.0.0.1:27017/safetywatch', { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB!');

    const CrimeSchema = new mongoose.Schema({
      id: String,
      city: String,
      area: String,
      station: String,
      crime_type: String,
      latitude: Number,
      longitude: Number,
      date: String,
      time: String,
      hour: Number,
      month: Number,
      year: Number,
      severity: Number,
      risk_score: Number,
      status: String,
      description: String
    });

    const Crime = mongoose.models.Crime || mongoose.model('Crime', CrimeSchema);
    await Crime.deleteMany({});
    console.log('🗑️ Cleared existing Crime collection.');
    await Crime.insertMany(crimes);
    console.log(`✨ Successfully seeded ${crimes.length} NCR records into MongoDB!`);
    await mongoose.connection.close();
  } catch (e) {
    console.log(`⚠️ Could not seed MongoDB: ${e.message}`);
    console.log('ℹ️ SafetyWatch backend is configured with seamless local JSON fallback.');
  }
}

combineDatasets();
