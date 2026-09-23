try { process.loadEnvFile(); } catch (e) {}

const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');
const crimeRoutes = require('./routes/crimes');
const emergencyRoutes = require('./routes/emergency');
const mlRoutes = require('./routes/ml');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ml', mlRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    region: 'NCR Region (Delhi, Noida, Gurugram, Ghaziabad, Faridabad, Greater Noida)',
    fast2sms_key_configured: Boolean(process.env.FAST2SMS_API_KEY && !process.env.FAST2SMS_API_KEY.includes('YOUR_')),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SafetyWatch NCR Crime Analytics & ML API running on port ${PORT}`);
  if (process.env.FAST2SMS_API_KEY && !process.env.FAST2SMS_API_KEY.includes('YOUR_')) {
    console.log(`📱 Cellular SMS Gateway ACTIVE with Fast2SMS API Key!`);
  }
});