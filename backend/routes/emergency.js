const express = require('express');
const router = express.Router();
const { getStations, sendSOS } = require('../controllers/emergencyController');

router.get('/stations', getStations);
router.post('/sos', sendSOS);

module.exports = router;
