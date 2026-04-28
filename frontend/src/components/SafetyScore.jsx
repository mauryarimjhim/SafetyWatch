import { Shield } from "lucide-react";
import { getSafetyLevel } from "../utils/constants";

export default function SafetyScore({ score = 0, label = "" }) {
  const level = getSafetyLevel(score);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={16} className="text-orange-400" />
        <span className="text-white font-semibold text-sm">Safety Score</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2540" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={level.color} strokeWidth="8"
              strokeDasharray={`${score * 2.51} 251`} strokeLinecap="round"
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color: level.color }}>{score}</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: level.color }}>{level.label}</div>
          {label && <div className="text-xs text-gray-500 mt-0.5">{label}</div>}
        </div>
      </div>
    </div>
  );
}
