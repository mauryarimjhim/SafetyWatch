import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, TrendingUp, Navigation, Zap, Flame, MapPin } from 'lucide-react';
import { NCR_CITIES, NCR_CITY_LOCALITIES } from '../utils/constants';

export default function CityDangerPredictionWidget({ dangerZones = [], currentCity = 'Delhi', onCityChange }) {
  const navigate = useNavigate();
  const [selectedCityTab, setSelectedCityTab] = useState(currentCity);

  const activeCity = selectedCityTab || currentCity;

  // Categorize authentic danger areas strictly according to the active city
  const cityLocalities = NCR_CITY_LOCALITIES[activeCity] || NCR_CITY_LOCALITIES['Delhi'];

  const activeZones = cityLocalities.map((item) => ({
    area: item.area,
    city: activeCity,
    predictedRiskScore: item.riskScore,
    riskLevel: item.riskLevel,
    topPredictedCrime: item.topCrime,
    predictedTimeWindow: item.peakHours,
    predictedSurge: item.surge,
    patrolPriority: item.patrolPriority,
    lat: item.lat,
    lng: item.lng
  }));

  const handleCitySelect = (c) => {
    setSelectedCityTab(c);
    if (onCityChange) onCityChange(c);
  };

  const handleNavigateToMap = (zone) => {
    navigate('/map', {
      state: {
        destination: zone.area,
        lat: zone.lat,
        lng: zone.lng,
        city: zone.city
      }
    });
  };

  return (
    <div className="glass-card p-6 md:p-7 border border-red-500/30 bg-gradient-to-br from-red-950/20 via-dark-950 to-dark-900 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              <Flame size={20} />
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              🔥 City Danger Zone & Crime Risk Predictor
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            ML Spatial Hotspot Forecasts & High-Risk Danger Area Predictions for NCR Cities
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full text-xs font-mono font-bold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>LIVE RISK RADAR ACTIVE</span>
        </div>
      </div>

      {/* City Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
          <MapPin size={13} className="text-orange-400" /> Select City Danger Scope:
        </span>
        {NCR_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => handleCitySelect(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCity === c
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20 border border-red-400/50"
                : "bg-dark-900/80 text-gray-400 hover:text-white hover:bg-dark-800 border border-gray-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Danger Hotspot Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeZones.map((zone, idx) => {
          const isCritical = zone.predictedRiskScore >= 88;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all duration-300 relative group hover:scale-[1.01] ${
                isCritical
                  ? 'bg-gradient-to-b from-red-950/40 to-dark-950 border-red-500/40 hover:border-red-500/70 shadow-lg shadow-red-950/50'
                  : 'bg-gradient-to-b from-amber-950/20 to-dark-950 border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold block mb-0.5">
                    📍 {zone.city} Danger Hotspot #{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition">
                    {zone.area}
                  </h3>
                </div>

                {/* Predicted Risk Score Badge */}
                <div
                  className={`px-2.5 py-1 rounded-lg text-center font-black border ${
                    isCritical
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <div className="text-xs font-mono">{zone.predictedRiskScore}/100</div>
                  <div className="text-[9px] uppercase tracking-tighter">{zone.riskLevel}</div>
                </div>
              </div>

              {/* Prediction Details Box */}
              <div className="space-y-2 text-xs bg-dark-900/90 p-3 rounded-lg border border-gray-800/80 mb-3">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert size={13} className="text-red-400" /> Top Crime:
                  </span>
                  <span className="font-semibold text-white">{zone.topPredictedCrime}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                    <Clock size={13} className="text-cyan-400" /> Danger Time Window:
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{zone.predictedTimeWindow}</span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                    <TrendingUp size={13} className="text-amber-400" /> AI Forecasted Surge:
                  </span>
                  <span className="font-mono text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    {zone.predictedSurge} (Next 30 Days)
                  </span>
                </div>
              </div>

              {/* Patrol & Action Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                  <Zap size={11} className="text-yellow-400" /> {zone.patrolPriority}
                </span>

                <button
                  onClick={() => handleNavigateToMap(zone)}
                  className="text-xs font-bold text-orange-400 hover:text-white px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 transition flex items-center gap-1"
                >
                  <Navigation size={12} /> View on Map
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
