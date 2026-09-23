const express = require('express');
const router = express.Router();
const { runKMeansClustering, predictCrimeRisk, evaluateRouteSafety } = require('../services/mlService');
const { getCrimes, getAllCrimes } = require('../services/crimeDataService');

// GET /api/ml/clusters?city=Delhi&k=6
router.get('/clusters', (req, res) => {
  const city = req.query.city || 'Delhi';
  const k = parseInt(req.query.k, 10) || 6;
  const crimes = getCrimes(city, 1000);
  const clusters = runKMeansClustering(crimes, k);
  res.json({ city, totalCrimesAnalyzed: crimes.length, k, clusters });
});

// POST /api/ml/predict
router.post('/predict', (req, res) => {
  const { lat, lng, city, hour, dayOfWeek } = req.body;
  const crimes = getAllCrimes();
  const prediction = predictCrimeRisk({ lat, lng, city, hour, dayOfWeek, crimes });
  res.json({ success: true, prediction });
});

// POST /api/ml/route-risk
router.post('/route-risk', (req, res) => {
  const { waypoints } = req.body;
  const crimes = getAllCrimes();
  const evaluation = evaluateRouteSafety(waypoints, crimes);
  res.json({ success: true, evaluation });
});

module.exports = router;
