const express = require('express');
const router = express.Router();
const { getStations, sendSOS, sendMobileSMS } = require('../controllers/emergencyController');

router.get('/stations', getStations);
router.post('/sos', sendSOS);
router.post('/send-sms', sendMobileSMS);

module.exports = router;
