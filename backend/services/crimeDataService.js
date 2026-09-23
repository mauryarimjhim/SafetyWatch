/**
 * Crime data service — Loads and queries the unified combined NCR dataset (~11,700+ records)
 */

const fs = require('fs');
const path = require('path');

let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (e) {}

const NCR_CITIES = {
  Delhi: { lat: 28.6139, lng: 77.2090, areas: ['Connaught Place','Karol Bagh','Saket','Dwarka','Rohini','Chandni Chowk','Lajpat Nagar','Janakpuri','Pitampura','Nehru Place'] },
  Noida: { lat: 28.5355, lng: 77.3910, areas: ['Sector 18','Sector 62','Sector 137','Knowledge Park','Noida Extension','Sector 50','Sector 76','Film City','Sector 44','Sector 15A'] },
  Gurugram: { lat: 28.4595, lng: 77.0266, areas: ['Cyber City','MG Road','DLF Phase 3','Golf Course Road','Sohna Road','Sector 29','Sector 56','Udyog Vihar','Huda City Centre','Palam Vihar'] },
  Ghaziabad: { lat: 28.6692, lng: 77.4538, areas: ['Indirapuram','Vaishali','Vasundhara','Raj Nagar','Crossings Republik','Kavi Nagar','Sahibabad','Mohan Nagar','Vijay Nagar','Surya Nagar'] },
  Faridabad: { lat: 28.4089, lng: 77.3178, areas: ['NIT Faridabad','Sector 15','Sector 16','Greater Faridabad','Ballabhgarh','Old Faridabad','Surajkund','Green Field','Sector 21','Sector 31'] },
  'Greater Noida': { lat: 28.4744, lng: 77.5040, areas: ['Pari Chowk','Omega 1','Alpha 2','Delta 1','Knowledge Park 3','Tech Zone 4','Greater Noida West','Surajpur','Ecotech','Zeta 1'] }
};

const CRIME_TYPES = ['Theft', 'Assault', 'Robbery', 'Burglary', 'Vandalism', 'Harassment', 'Fraud', 'Murder', 'Cyber Crime', 'Vehicle Theft'];

let memoryDataset = null;

function loadDataset() {
  if (memoryDataset) return memoryDataset;

  const jsonPath = path.join(__dirname, '../data/combined_ncr_dataset.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const data = fs.readFileSync(jsonPath, 'utf8');
      memoryDataset = JSON.parse(data);
      console.log(`✅ Loaded ${memoryDataset.length} unified NCR crime records into memory.`);
      return memoryDataset;
    } catch (e) {
      console.error('Error reading dataset file:', e);
    }
  }

  memoryDataset = [];
  return memoryDataset;
}

function getCrimes(city = 'Delhi', limit = 500) {
  const dataset = loadDataset();

  let filtered = dataset;
  if (city && city !== 'All') {
    filtered = dataset.filter(c => c.city && c.city.toLowerCase() === city.toLowerCase());
  }

  // If city not found or dataset empty, fallback to returning sliced dataset
  if (filtered.length === 0) {
    filtered = dataset.slice(0, limit);
  }

  return filtered.slice(0, limit);
}

function getAllCrimes() {
  return loadDataset();
}

function getCityStats() {
  const dataset = loadDataset();
  const stats = {};

  Object.keys(NCR_CITIES).forEach(c => {
    stats[c] = {
      city: c,
      total_crimes: 0,
      high_risk_count: 0,
      lat: NCR_CITIES[c].lat,
      lng: NCR_CITIES[c].lng,
      top_crime: 'Theft'
    };
  });

  const cityCrimeTypeCounts = {};

  dataset.forEach(c => {
    const cityName = c.city || 'Delhi';
    if (!stats[cityName]) {
      stats[cityName] = {
        city: cityName,
        total_crimes: 0,
        high_risk_count: 0,
        lat: 28.6139,
        lng: 77.2090,
        top_crime: 'Theft'
      };
    }

    stats[cityName].total_crimes++;
    if (c.risk_score >= 70) stats[cityName].high_risk_count++;

    if (!cityCrimeTypeCounts[cityName]) cityCrimeTypeCounts[cityName] = {};
    cityCrimeTypeCounts[cityName][c.crime_type] = (cityCrimeTypeCounts[cityName][c.crime_type] || 0) + 1;
  });

  Object.keys(stats).forEach(cityName => {
    const counts = cityCrimeTypeCounts[cityName];
    if (counts) {
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (top) stats[cityName].top_crime = top[0];
    }
  });

  return Object.values(stats);
}

module.exports = {
  getCrimes,
  getAllCrimes,
  getCityStats,
  CITIES: NCR_CITIES,
  CRIME_TYPES
};
