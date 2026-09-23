import React, { useState } from 'react';
import { Cpu, ShieldAlert, AlertTriangle, Clock, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { predictMLRisk } from '../services/api';
import { CITY_COORDS } from '../utils/constants';

const NCR_CITIES = Object.keys(CITY_COORDS);

export default function MLRiskPredictor({ currentCity = 'Delhi', onLocationSelect }) {
  const [city, setCity] = useState(currentCity);
  const [hour, setHour] = useState(new Date().getHours());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const coords = CITY_COORDS[city] || CITY_COORDS.Delhi;
      const res = await predictMLRisk({
        city,
        lat: coords.lat,
        lng: coords.lng,
        hour: parseInt(hour, 10),
      });
      setResult(res.prediction);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden border border-orange-500/20 rounded-xl bg-gradient-to-br from-dark-900/90 to-dark-800/90">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              ML Crime Risk Predictor
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-semibold px-2 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-1">
                <Sparkles size={10} /> NCR AI Model
              </span>
            </h3>
            <p className="text-gray-400 text-xs">Real-time machine learning prediction based on historical NCR crime patterns</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-gray-400 text-xs mb-1 block font-medium flex items-center gap-1">
            <MapPin size={12} className="text-orange-400" /> NCR Territory
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-dark-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50"
          >
            {NCR_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-xs mb-1 block font-medium flex items-center gap-1">
            <Clock size={12} className="text-orange-400" /> Time of Day ({String(hour).padStart(2, '0')}:00)
          </label>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-semibold hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {loading ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <>
                <Sparkles size={14} /> Run ML Risk Classifier
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 pt-4 border-t border-gray-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-dark-950/80 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs">Predicted Risk Index</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                result.predicted_risk_index >= 75 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                result.predicted_risk_index >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {result.risk_level}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-black ${
                result.predicted_risk_index >= 75 ? 'text-red-500' :
                result.predicted_risk_index >= 50 ? 'text-amber-400' :
                'text-emerald-400'
              }`}>
                {result.predicted_risk_index}/100
              </span>
              <span className="text-xs text-gray-500">
                ({result.nearby_historical_incidents} nearby incidents weighed)
              </span>
            </div>

            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-500 ${
                  result.predicted_risk_index >= 75 ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                  result.predicted_risk_index >= 50 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${result.predicted_risk_index}%` }}
              />
            </div>

            <div className="space-y-1 mt-3">
              <span className="text-gray-400 text-[11px] font-semibold block mb-1">Crime Type Probabilities:</span>
              {Object.entries(result.probabilities || {}).slice(0, 4).map(([t, p]) => (
                <div key={t} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">{t}</span>
                  <span className="text-orange-400 font-medium">{p}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-950/80 border border-gray-800">
            <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-orange-400" /> AI Safety Advisory
            </h4>
            <ul className="space-y-2">
              {result.safety_recommendations?.map((rec, i) => (
                <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-2 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between">
              <span>Model: {result.ml_model_version}</span>
              <span>Evaluated Time: {result.time_evaluated}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
