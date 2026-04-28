# 🛡️ SafetyWatch — Smart Crime Map & Safety Navigation System

An AI-powered full-stack web application for crime prediction, safe route planning, and real-time emergency tools.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-brightgreen?logo=leaflet)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

---

## ✨ Features

### 🗺️ Interactive Crime Map
- Dark-themed Leaflet map with CARTO tiles
- Crime heatmap overlay (green → red density gradient)
- Individual crime markers with severity-based coloring
- Filters: crime type, severity slider, date range
- Toggle heatmap and marker layers independently

### 🚗 Smart Route Navigation (Fixed!)
- **Fastest Route** (blue) vs **Safest Route** (green) toggle
- OSRM-powered route calculation with real road paths
- Distance (km) and estimated travel time
- Multiple alternative routes displayed
- Per-segment risk visualization (red circles on dangerous zones)
- Safety score gauge (0-100)

### 🧠 ML-Powered Analytics Dashboard
- **Crime Prediction**: Linear regression + seasonal decomposition (6-month forecast)
- **Anomaly Detection**: Z-score based spike detection
- **Charts**: Pie (type distribution), Line (trends + predictions), Area (hourly risk), Bar (area comparison)
- Safety index with crime rate and density metrics
- City-wise analysis for 11+ Indian cities

### 🚨 Emergency Features
- **SOS Button**: Floating pulsing button on all pages — sends GPS alert + Web Share API
- **GPS Live Tracking**: Real-time position monitoring with tracking history
- **Nearby Police Stations**: Distance-sorted list with phone numbers
- **8 Emergency Helplines**: Tap-to-call cards (Police, Ambulance, Fire, Women, Child, Cyber, Disaster, Road)

### 🎨 Premium UI/UX
- Dark mode with glassmorphism
- Gradient accents (orange → pink)
- Split layout: Sidebar + Map
- Responsive design with mobile hamburger menu
- Smooth animations and micro-interactions

---

## 📁 Project Structure

```
safetwatch/
├── frontend/                  ← React + Vite + Tailwind
│   ├── src/
│   │   ├── components/        (8 components)
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── SearchBox.jsx
│   │   │   ├── FeatureCards.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── RouteControls.jsx
│   │   │   ├── RouteDisplay.jsx
│   │   │   ├── CrimeFilters.jsx
│   │   │   ├── SafetyScore.jsx
│   │   │   └── SOSButton.jsx
│   │   ├── pages/             (4 pages)
│   │   │   ├── Home.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── EmergencyPage.jsx
│   │   ├── services/          (3 services)
│   │   │   ├── api.js
│   │   │   ├── geocoding.js
│   │   │   └── routing.js
│   │   └── utils/             (4 modules)
│   │       ├── constants.js
│   │       ├── crimeData.js
│   │       ├── riskScoring.js
│   │       └── mlPredictor.js
│   └── package.json
│
└── backend/                   ← Express API
    ├── routes/
    │   ├── analytics.js
    │   ├── crimes.js
    │   └── emergency.js
    ├── controllers/
    │   ├── analyticsController.js
    │   ├── crimeController.js
    │   └── emergencyController.js
    ├── services/
    │   └── crimeDataService.js
    ├── server.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running

```bash
# Clone the repo
git clone https://github.com/mauryarimjhim/Crime_map.git
cd Crime_map

# Start Backend (Terminal 1)
cd backend
npm install
node server.js          # → http://localhost:5000

# Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

---

## 🛠️ Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Frontend   | React 19, Vite 8, Tailwind CSS  |
| Maps       | Leaflet + CARTO dark tiles      |
| Routing    | OSRM (free, no API key)         |
| Geocoding  | Nominatim (OpenStreetMap)        |
| Charts     | Recharts                         |
| Backend    | Node.js + Express 5             |
| ML         | Custom JS (regression, decomposition, anomaly detection) |

> **No API keys required** — uses entirely free/open services.

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics?city=Delhi` | GET | Crime analytics with ML predictions |
| `/api/crimes?city=Delhi&type=Theft` | GET | Filtered crime data |
| `/api/crimes/heatmap?city=Delhi` | GET | Heatmap data points |
| `/api/crimes/report` | POST | Report a crime incident |
| `/api/emergency/stations?lat=28.6&lng=77.2` | GET | Nearby police stations |
| `/api/emergency/sos` | POST | Send SOS alert |
| `/api/health` | GET | Health check |

---

## 📄 License

MIT License — feel free to use and modify.

---

Made with ❤️ for public safety
