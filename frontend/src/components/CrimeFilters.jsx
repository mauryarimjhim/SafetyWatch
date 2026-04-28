import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { CRIME_TYPES, SEVERITY_LABELS } from "../utils/constants";

export default function CrimeFilters({ filters, onFilterChange, showHeatmap, onToggleHeatmap, showMarkers, onToggleMarkers, crimeCount = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const updateFilter = (key, value) => onFilterChange({ ...filters, [key]: value });
  const clearFilters = () => onFilterChange({ type: "all", severity: 0, dateFrom: "", dateTo: "" });
  const hasActive = filters.type !== "all" || filters.severity > 0 || filters.dateFrom || filters.dateTo;

  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-orange-400" />
          <span className="text-white font-semibold text-sm">Crime Filters</span>
          <span className="text-gray-500 text-xs">({crimeCount})</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex gap-2">
            <button onClick={onToggleHeatmap} className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${showHeatmap ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-dark-900 text-gray-500 border border-gray-800"}`}>🔥 Heatmap</button>
            <button onClick={onToggleMarkers} className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${showMarkers ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-dark-900 text-gray-500 border border-gray-800"}`}>📍 Markers</button>
          </div>
          <div>
            <label className="text-gray-500 text-xs font-medium mb-1 block">Crime Type</label>
            <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)} className="w-full bg-dark-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50">
              {CRIME_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-xs font-medium mb-1 block">Min Severity: {filters.severity || "Any"}</label>
            <input type="range" min={0} max={5} value={filters.severity} onChange={(e) => updateFilter("severity", parseInt(e.target.value))} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-gray-500 text-xs font-medium mb-1 block">From</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => updateFilter("dateFrom", e.target.value)} className="w-full bg-dark-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none" />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium mb-1 block">To</label>
              <input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} className="w-full bg-dark-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none" />
            </div>
          </div>
          {hasActive && <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition"><X size={12} /> Clear filters</button>}
        </div>
      )}
    </div>
  );
}
