import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SOSButton from "../components/SOSButton";
import MLRiskPredictor from "../components/MLRiskPredictor";
import AnalyticsLocationSearch from "../components/AnalyticsLocationSearch";
import UnsafeZoneSentinel from "../components/UnsafeZoneSentinel";
import CityDangerPredictionWidget from "../components/CityDangerPredictionWidget";
import { CHART_COLORS, CITY_COORDS, NCR_CITIES, getSafetyLevel } from "../utils/constants";
import { fetchAnalytics, fetchNCRSummary } from "../services/api";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar,
  ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { Brain, Shield, Clock, MapPin, BarChart3, Building2, Sparkles, Navigation } from "lucide-react";

export default function AnalyticsPage() {
  const loc = useLocation();
  const defaultCity = loc.state?.destination || "Delhi";
  const [city, setCity] = useState(defaultCity);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [ncrSummary, setNcrSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchAnalytics(city).catch(err => console.warn(err)),
      fetchNCRSummary().catch(err => console.warn(err))
    ]).then(([analyticsRes, summaryRes]) => {
      if (!isMounted) return;
      if (analyticsRes) setAnalyticsData(analyticsRes);
      if (summaryRes) setNcrSummary(summaryRes);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [city]);

  const handleLocationSelect = (placeInfo) => {
    setSelectedPlace(placeInfo);
    if (placeInfo.city) {
      setCity(placeInfo.city);
    }
  };

  const safetyScore = analyticsData?.safetyScore || 65;
  const safetyLevel = getSafetyLevel(safetyScore);

  return (
    <div className="bg-dark-900 min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-black">
            <span className="gradient-text">NCR Crime Analytics</span> & ML Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Place-specific crime analysis, live GPS tracking & AI safety predictions
          </p>
        </div>

        {/* Location Search & Live GPS Bar */}
        <div className="mb-6">
          <AnalyticsLocationSearch
            onSelectLocation={handleLocationSelect}
            currentLocationName={selectedPlace?.name || city}
          />
        </div>

        {/* Live GPS Unsafe Zone Sentinel Component */}
        <div className="mb-6 max-w-4xl mx-auto">
          <UnsafeZoneSentinel onLocationDetected={handleLocationSelect} />
        </div>

        {/* Active Place/GPS Banner */}
        {selectedPlace && (
          <div className="mb-6 p-4 rounded-xl glass-card border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {selectedPlace.isGps ? <Navigation size={18} className="animate-pulse" /> : <MapPin size={18} />}
              </div>
              <div>
                <span className="text-xs font-semibold text-orange-400 block uppercase tracking-wider">
                  {selectedPlace.isGps ? '📡 Live GPS Location Analytics' : '📍 Place Analytics Focus'}
                </span>
                <span className="text-base font-bold text-white block">{selectedPlace.name}</span>
                <span className="text-xs text-gray-400 block">{selectedPlace.displayName || selectedPlace.city}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlace(null)}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-dark-900 border border-gray-800"
            >
              Reset to City View
            </button>
          </div>
        )}

        {/* NCR Territory Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 glass-card p-2">
          {NCR_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCity(c); setSelectedPlace(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                city === c && !selectedPlace
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20"
                  : "bg-dark-950/60 text-gray-400 hover:text-white hover:bg-dark-800"
              }`}
            >
              <MapPin size={12} className={city === c ? "text-white" : "text-orange-400"} />
              {c}
            </button>
          ))}
        </div>

        {/* Interactive ML Risk Predictor Widget */}
        <div className="mb-8">
          <MLRiskPredictor currentCity={city} />
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Analyzed Crimes", value: analyticsData?.totalCrimes || '11,750+', icon: BarChart3, color: "text-orange-400", bg: "from-orange-500/10" },
            { label: "Safety Index", value: `${safetyScore}/100`, icon: Shield, color: safetyLevel.color, bg: safetyScore >= 70 ? "from-green-500/10" : "from-yellow-500/10" },
            { label: "Most Common Crime", value: analyticsData?.mostCommonType || "Theft", icon: Brain, color: "text-purple-400", bg: "from-purple-500/10" },
            { label: "Peak Crime Hours", value: analyticsData?.peakHours?.[0] || "21:00", icon: Clock, color: "text-cyan-400", bg: "from-cyan-500/10" },
          ].map((stat, i) => (
            <div key={i} className={`glass-card p-4 bg-gradient-to-br ${stat.bg} to-transparent`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-gray-400 text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-white">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Crime Types Distribution */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" /> Crime Type Breakdown ({selectedPlace?.name || city})
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={analyticsData?.pie || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {(analyticsData?.pie || []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend & Predictions */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" /> Monthly Incident Trends
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analyticsData?.line || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="crimes" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4, fill: '#a855f7' }} name="Reported Incidents" />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* AI Danger Zone Crime Predictor & Hotspot Risk Radar (Replaces Police Station Graph) */}
        <div className="mb-8">
          <CityDangerPredictionWidget
            dangerZones={analyticsData?.dangerZones}
            currentCity={city}
            onCityChange={(c) => { setCity(c); setSelectedPlace(null); }}
          />
        </div>

        {/* NCR Regional Territory Comparison */}
        {ncrSummary && ncrSummary.stats && (
          <div className="glass-card p-6 mb-8 border border-orange-500/20 bg-dark-950/70">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-orange-400" />
              NCR Territory Comparison (Unified Database Metrics)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {ncrSummary.stats.map(s => (
                <div
                  key={s.city}
                  onClick={() => { setCity(s.city); setSelectedPlace(null); }}
                  className={`p-3 rounded-xl cursor-pointer transition border ${
                    city === s.city && !selectedPlace ? 'bg-orange-500/20 border-orange-500/50' : 'bg-dark-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className="text-gray-400 text-xs font-semibold block">{s.city}</span>
                  <span className="text-lg font-black text-white block my-1">{s.total_crimes}</span>
                  <div className="text-[10px] text-gray-500 flex justify-between">
                    <span>High Risk: <span className="text-red-400 font-semibold">{s.high_risk_count}</span></span>
                  </div>
                  <div className="text-[10px] text-orange-400 mt-1 truncate">
                    Top: {s.top_crime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <SOSButton />
    </div>
  );
}
