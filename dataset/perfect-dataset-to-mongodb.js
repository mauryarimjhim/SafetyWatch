// array-dataset-to-mongodb.js (YOUR EXACT FORMAT)
const fs = require('fs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/safetywatch');

const CrimeSchema = new mongoose.Schema({
  station: String,
  crime_type: String,
  time: String,
  date: String,
  status: String,
  code: String,
  description: String,
  latitude: Number,
  longitude: Number,
  risk_score: Number
});
const Crime = mongoose.model('Crime', CrimeSchema);

async function parseArrayDataset() {
  console.log('📥 Loading ARRAY dataset...');
  
  const rawData = JSON.parse(fs.readFileSync('crime_dataset3.json'));
  console.log(`✅ Loaded ${rawData.length} array records`);
  
  const crimes = [];
  
  rawData.forEach((row, i) => {
    if (!Array.isArray(row) || row.length < 7) return;
    
    // YOUR exact format: [station, crime_type, time, date, status, code, desc]
    const [
      station = 'Unknown',
      crime_type = 'Unknown', 
      time = '00:00',
      date = '2023-01-01',
      status = 'Unknown',
      code = 'Unknown',
      description = 'No desc'
    ] = row;
    
    // Risk scoring
    const riskMap = {
      'assualt murders': 90,
      'murder': 95,
      'rape': 92,
      'robbery': 85,
      'assault': 75,
      'burglary': 70,
      'fraud': 45,
      'theft': 55,
      'vandalism': 60
    };
    
    const risk_score = riskMap[crime_type.toLowerCase()] || 50 + Math.floor(Math.random() * 30);
    
    // Delhi coords (random realistic)
    const lat = 28.5 + Math.random() * 0.4;  // 28.5-28.9
    const lng = 76.9 + Math.random() * 0.6;  // 76.9-77.5
    
    crimes.push({
      station: station.toString().substring(0, 50),
      crime_type: crime_type.toString(),
      time,
      date,
      status,
      code,
      description: description.toString(),
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      risk_score
    });
  });
  
  console.log(`📊 Generated ${crimes.length} crimes`);
  console.log('Sample:', JSON.stringify(crimes[0], null, 2));
  
  // Store
  
  const result = await Crime.insertMany(crimes);
  
  console.log('✅ SAVED TO MONGODB!');
  console.log(`📈 Total: ${result.length}`);
  console.log(`🔥 High-risk (>70): ${crimes.filter(c => c.risk_score > 70).length}`);
  
  // Verify
  const count = await Crime.countDocuments();
  console.log(`🔍 DB Count: ${count}`);
  
  const sampleDB = await Crime.findOne();
  console.log('DB Sample:', JSON.stringify(sampleDB, null, 2));
  
  mongoose.connection.close();
}

parseArrayDataset().catch(console.error);
