const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');
const crimeRoutes = require('./routes/crimes');
const emergencyRoutes = require('./routes/emergency');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SafetyWatch API running on port ${PORT}`);
});