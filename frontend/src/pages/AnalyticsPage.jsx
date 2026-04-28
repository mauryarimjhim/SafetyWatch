import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SOSButton from "../components/SOSButton";
import { CHART_COLORS, CITY_COORDS, getSafetyLevel } from "../utils/constants";
import { generateCrimeData, getMonthlyTrend, getCrimeTypeDistribution, getAreaStats, getHourlyCounts } from "../utils/crimeData";
import { predictFutureCrimes, detectAnomalies, predictRiskByTime, calculateAreaSafety } from "../utils/mlPredictor";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar,
  AreaChart, Area, ResponsiveContainer, Legend, CartesianGrid, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Search, TrendingUp, TrendingDown, Minus, Brain, AlertTriangle, Shield, Clock, MapPin, BarChart3 } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AnalyticsPage() {
  const loc = useLocation();
  const defaultCity = loc.state?.destination || "Delhi";
  const [city, setCity] = useState(defaultCity);
  const [inputCity, setInputCity] = useState("");

  const crimes = useMemo(() => generateCrimeData(city, 400), [city]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(crimes), [crimes]);
  const typeDistribution = useMemo(() => getCrimeTypeDistribution(crimes), [crimes]);
  const areaStats = useMemo(() => getAreaStats(crimes), [crimes]);
  const hourlyCounts = useMemo(() => getHourlyCounts(crimes), [crimes]);

  // ML Predictions
  const monthlyValues = monthlyTrend.map(m => m.crimes);
  const prediction = useMemo(() => predictFutureCrimes(monthlyValues, 6), [monthlyValues]);
  const anomalies = useMemo(() => detectAnomalies(monthlyValues), [monthlyValues]);
  const timeRisk = useMemo(() => predictRiskByTime(hourlyCounts), [hourlyCounts]);
  const areaSafety = useMemo(() => calculateAreaSafety(crimes.length), [crimes]);

  // Build combined trend + prediction chart data
  const trendWithPrediction = useMemo(() => {
    const data = monthlyTrend.map(m => ({ ...m, predicted: null }));
    prediction.predictions.forEach((val, i) => {
      const monthIdx = (new Date().getMonth() + 1 + i) % 12;
      data.push({ month: MONTHS[monthIdx], crimes: null, predicted: val });
    });
    return data;
  }, [monthlyTrend, prediction]);

  // Hourly risk chart
  const hourlyData = timeRisk.hourlyRisk.map(h => ({
    hour: h.label,
    risk: h.riskLevel,
    crimes: h.crimeCount,
  }));

  const trendIcon = prediction.trendDirection === "increasing" ? <TrendingUp size={14} className="text-red-400" /> :
    prediction.trendDirection === "decreasing" ? <TrendingDown size={14} className="text-green-400" /> :
    <Minus size={14} className="text-yellow-400" />;

  const safetyLevel = getSafetyLevel(areaSafety.score);

  return (
    <div className="bg-dark-900 min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black">
            <span className="gradient-text">Crime Analytics</span> Dashboard
          </h1>
          <p className="text-gray-500 mt-2">ML-powered insights and crime predictions for {city}</p>
        </div>

        {/* City Search */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 glass-card p-2 pl-4 w-full max-w-md">
            <Search size={16} className="text-gray-500" />
            <input type="text" placeholder="Search city..." value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inputCity && setCity(inputCity)}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder-gray-600" />
            <button onClick={() => inputCity && setCity(inputCity)}
              className="btn-gradient text-xs px-4 py-2 rounded-xl">Analyze</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Crimes", value: crimes.length, icon: BarChart3, color: "text-orange-400", bg: "from-orange-500/10" },
            { label: "Safety Index", value: `${areaSafety.score}/100`, icon: Shield, color: safetyLevel.color, bg: areaSafety.score >= 70 ? "from-green-500/10" : areaSafety.score >= 40 ? "from-yellow-500/10" : "from-red-500/10" },
            { label: "ML Confidence", value: `${prediction.confidence}%`, icon: Brain, color: "text-purple-400", bg: "from-purple-500/10" },
            { label: "Peak Hours", value: timeRisk.peakHours.length > 0 ? timeRisk.peakHours.slice(0, 2).join(", ") : "None", icon: Clock, color: "text-cyan-400", bg: "from-cyan-500/10" },
          ].map((stat, i) => (
            <div key={i} className={`glass-card p-4 bg-gradient-to-br ${stat.bg} to-transparent animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-gray-500 text-xs">{stat.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color : undefined }}>
                <span className={typeof stat.color === 'string' && stat.color.startsWith('text-') ? stat.color : ''}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ML Prediction Banner */}
        <div className="glass-card p-4 mb-8 flex flex-wrap items-center gap-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <div className="p-2 rounded-xl bg-purple-500/10"><Brain size={20} className="text-purple-400" /></div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              ML Crime Prediction {trendIcon}
              <span className="text-xs font-normal text-gray-500">({prediction.modelInfo.type})</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Trend: <span className={prediction.trendDirection === "increasing" ? "text-red-400" : prediction.trendDirection === "decreasing" ? "text-green-400" : "text-yellow-400"}>
                {prediction.trendDirection}
              </span> · R²: {prediction.modelInfo.r2} · Next 6 months forecast: {prediction.predictions.join(", ")}
            </div>
          </div>
          {anomalies.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
              <AlertTriangle size={12} /> {anomalies.length} anomalies detected
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Crime Distribution Pie */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" /> Crime Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                  {typeDistribution.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Crime Trend + Prediction Line */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Crime Trend & ML Forecast
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendWithPrediction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="crimes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#a855f7' }} name="Predicted" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Risk Area Chart */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Hourly Risk Analysis
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} interval={2} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} />
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} name="Risk Level" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Area Comparison Bar */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Area-wise Comparison
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={areaStats.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={11} />
                <YAxis dataKey="area" type="category" stroke="#6b7280" fontSize={10} width={90} />
                <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="crimes" fill="#f97316" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety Assessment */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-transparent" style={{ background: `linear-gradient(135deg, ${safetyLevel.bg}, transparent)` }}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield size={20} style={{ color: safetyLevel.color }} />
            Overall Safety Assessment for {city}
          </h3>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2540" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={safetyLevel.color} strokeWidth="8"
                  strokeDasharray={`${areaSafety.score * 2.51} 251`} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black" style={{ color: safetyLevel.color }}>{areaSafety.score}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold" style={{ color: safetyLevel.color }}>{safetyLevel.label}</div>
              <div className="text-xs text-gray-500">Crime rate: {areaSafety.crimeRate} per 100K</div>
              <div className="text-xs text-gray-500">Density factor: {areaSafety.densityFactor}</div>
            </div>
          </div>
        </div>
      </div>
      <SOSButton />
    </div>
  );
}
