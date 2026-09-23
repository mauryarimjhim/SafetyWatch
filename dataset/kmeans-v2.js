// kmeans-v2.js (FIXED - Real zone separation)
const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/safetywatch');

const Crime = mongoose.model('Crime', new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  risk_score: Number,
  crime_type: String,
  station: String
}));

function kMeans(data, k = 6, iterations = 200) {
  // Smarter initialization - spread centroids
  let centroids = [];
  centroids.push(data[Math.floor(Math.random() * data.length)]);
  
  for (let i = 1; i < k; i++) {
    const distances = data.map(point => {
      const minDist = Math.min(...centroids.map(c =>
        Math.sqrt(Math.pow(point[0] - c[0], 2) + Math.pow(point[1] - c[1], 2) + Math.pow((point[2] - c[2]) / 100, 2))
      ));
      return minDist;
    });
    const sum = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * sum;
    let chosen = 0;
    for (let j = 0; j < distances.length; j++) {
      rand -= distances[j];
      if (rand <= 0) { chosen = j; break; }
    }
    centroids.push([...data[chosen]]);
  }

  let assignments = new Array(data.length).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    assignments = data.map(point => {
      let minDist = Infinity, nearest = 0;
      centroids.forEach((c, i) => {
        const dist = Math.sqrt(
          Math.pow(point[0] - c[0], 2) +
          Math.pow(point[1] - c[1], 2) +
          Math.pow((point[2] - c[2]) / 20, 2)  // weight risk more
        );
        if (dist < minDist) { minDist = dist; nearest = i; }
      });
      return nearest;
    });

    centroids = centroids.map((_, ci) => {
      const pts = data.filter((_, i) => assignments[i] === ci);
      if (pts.length === 0) return centroids[ci];
      return [
        pts.reduce((s, p) => s + p[0], 0) / pts.length,
        pts.reduce((s, p) => s + p[1], 0) / pts.length,
        pts.reduce((s, p) => s + p[2], 0) / pts.length
      ];
    });
  }
  return { centroids, assignments };
}

async function run() {
  const crimes = await Crime.find({ latitude: { $exists: true } });
  console.log(`📊 Clustering ${crimes.length} crimes...`);

  const data = crimes.map(c => [c.latitude, c.longitude, c.risk_score || 50]);

  // Use 5 clusters (not 8) for better separation
  const { centroids, assignments } = kMeans(data, 5, 300);

  const zones = centroids.map((center, id) => {
    const clusterPoints = data.filter((_, i) => assignments[i] === id);
    const risks = clusterPoints.map(p => p[2]);
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length || 0;

    // Dominant crime types in this zone
    const zoneCrimes = crimes.filter((_, i) => assignments[i] === id);
    const crimeTypeCounts = {};
    zoneCrimes.forEach(c => {
      crimeTypeCounts[c.crime_type] = (crimeTypeCounts[c.crime_type] || 0) + 1;
    });
    const topCrime = Object.entries(crimeTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    const zone = {
      zone_id: id,
      center_lat: parseFloat(center[0].toFixed(6)),
      center_lng: parseFloat(center[1].toFixed(6)),
      avg_risk: Math.round(avgRisk),
      crime_count: clusterPoints.length,
      top_crime: topCrime,
      is_high_risk: avgRisk >= 75,
      is_medium_risk: avgRisk >= 50 && avgRisk < 75,
      risk_level: avgRisk >= 75 ? 'HIGH' : avgRisk >= 50 ? 'MEDIUM' : 'LOW',
      color: avgRisk >= 75 ? '#ff1744' : avgRisk >= 50 ? '#ff9800' : '#4caf50',
      radius: Math.min(1800, Math.max(600, 800 + clusterPoints.length * 0.8))
    };

    return zone;
  });

  // Sort by risk
  zones.sort((a, b) => b.avg_risk - a.avg_risk);

  console.log('\n🔥 DANGER ZONES (v2):');
  zones.forEach(z =>
    console.log(`Zone ${z.zone_id}: ${z.avg_risk}% ${z.risk_level} ${z.color === '#ff1744' ? '🔴' : z.color === '#ff9800' ? '🟡' : '🟢'} | ${z.crime_count} crimes | Top: ${z.top_crime}`)
  );

  fs.writeFileSync('danger-zones.json', JSON.stringify(zones, null, 2));

  console.log(`\n✅ DONE!`);
  console.log(`🔴 HIGH: ${zones.filter(z => z.risk_level === 'HIGH').length}`);
  console.log(`🟡 MEDIUM: ${zones.filter(z => z.risk_level === 'MEDIUM').length}`);
  console.log(`🟢 LOW: ${zones.filter(z => z.risk_level === 'LOW').length}`);

  mongoose.connection.close();
}

run().catch(console.error);
