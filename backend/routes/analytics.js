const express = require('express');
const router = express.Router();
const { getAnalytics, getNCRCityComparison } = require('../controllers/analyticsController');

router.get('/', getAnalytics);
router.get('/ncr-summary', getNCRCityComparison);

module.exports = router;
