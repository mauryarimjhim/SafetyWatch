const express = require('express');
const router = express.Router();
const { getCrimes, getHeatmap, reportCrime } = require('../controllers/crimeController');

router.get('/', getCrimes);
router.get('/heatmap', getHeatmap);
router.post('/report', reportCrime);

module.exports = router;
