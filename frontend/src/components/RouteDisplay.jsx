import { Route, Clock, Ruler, Shield, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function RouteDisplay({ routes = [], selectedIndex = 0, onSelectRoute }) {
  const [expanded, setExpanded] = useState(true);
  const selectedRoute = routes[selectedIndex];

  if (!routes.length) return null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          <Route size={16} className="text-orange-400" />
          <span className="text-white font-semibold text-sm">Route Details</span>
          <span className="text-gray-500 text-xs">({routes.length} found)</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {routes.map((route, idx) => {
            const isSelected = idx === selectedIndex;
            const scoreColor = (route.safetyScore || 0) >= 70 ? "text-green-400" : (route.safetyScore || 0) >= 40 ? "text-yellow-400" : "text-red-400";
            const scoreBg = (route.safetyScore || 0) >= 70 ? "bg-green-500/10" : (route.safetyScore || 0) >= 40 ? "bg-yellow-500/10" : "bg-red-500/10";

            return (
              <button
                key={idx}
                onClick={() => onSelectRoute(idx)}
                className={`w-full text-left rounded-xl p-3 transition-all duration-200 border ${
                  isSelected
                    ? `${route.isSafest ? "border-green-500/30 bg-green-500/5" : "border-blue-500/30 bg-blue-500/5"}`
                    : "border-gray-800 bg-dark-900 hover:bg-dark-700"
                }`}
              >
                {/* Route label */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    route.isSafest ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {route.isSafest ? "🛡️ Safest" : idx === 0 ? "⚡ Fastest" : `Route ${idx + 1}`}
                  </span>

                  {route.safetyScore !== undefined && (
                    <span className={`text-xs font-bold ${scoreColor} ${scoreBg} px-2 py-0.5 rounded-full`}>
                      Safety: {route.safetyScore}%
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Ruler size={12} />
                    <span className="text-white font-medium">{route.distanceKm} km</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={12} />
                    <span className="text-white font-medium">{route.durationFormatted}</span>
                  </div>
                  {route.highRiskSegments > 0 && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle size={12} />
                      <span className="font-medium">{route.highRiskSegments} risky</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
