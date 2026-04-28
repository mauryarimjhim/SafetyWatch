import { useState, useRef, useEffect } from "react";
import { MapPin, Search, Navigation, ToggleLeft, ToggleRight, Route, Shield } from "lucide-react";
import { searchPlaces } from "../services/geocoding";

export default function RouteControls({
  onSearch,
  onModeChange,
  routeMode = "fastest",
  loading = false,
  initialFrom = "",
  initialDest = "",
  initialFromCoords = null,
  initialDestCoords = null,
}) {
  const [from, setFrom] = useState(initialFrom);
  const [dest, setDest] = useState(initialDest);
  const [fromCoords, setFromCoords] = useState(initialFromCoords);
  const [destCoords, setDestCoords] = useState(initialDestCoords);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    setFrom(initialFrom);
    setDest(initialDest);
    setFromCoords(initialFromCoords);
    setDestCoords(initialDestCoords);
  }, [initialFrom, initialDest, initialFromCoords, initialDestCoords]);

  const handleSearch = (query, setSuggestions) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.length >= 2) {
        setSuggestions(await searchPlaces(query));
      } else {
        setSuggestions([]);
      }
    }, 400);
  };

  const doSearch = () => {
    if (!from || !dest) return;
    onSearch({ from, dest, fromCoords, destCoords });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setFrom("My Location");
        setFromCoords(coords);
        setFromSuggestions([]);
      },
      () => alert("Location access denied")
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <Route size={18} className="text-orange-400" />
        <h3 className="text-white font-bold text-sm">Route Finder</h3>
      </div>

      {/* From */}
      <div className="relative">
        <div className="flex items-center bg-dark-900 rounded-xl px-3 py-2.5 border border-gray-800 focus-within:border-orange-500/50 transition">
          <MapPin size={14} className="text-green-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Starting point"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setFromCoords(null);
              handleSearch(e.target.value, setFromSuggestions);
            }}
            className="bg-transparent outline-none text-white w-full text-xs placeholder-gray-500"
          />
          <button onClick={useMyLocation} className="ml-1 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyan-400 transition shrink-0">
            <Navigation size={12} />
          </button>
        </div>
        {fromSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-gray-700 rounded-lg overflow-hidden z-50 shadow-xl max-h-40 overflow-y-auto">
            {fromSuggestions.map((s, i) => (
              <button key={i} onClick={() => { setFrom(s.shortName); setFromCoords({ lat: s.lat, lng: s.lng }); setFromSuggestions([]); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 truncate">
                {s.shortName} <span className="text-gray-600">— {s.displayName.split(',').slice(1, 3).join(',')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination */}
      <div className="relative">
        <div className="flex items-center bg-dark-900 rounded-xl px-3 py-2.5 border border-gray-800 focus-within:border-orange-500/50 transition">
          <MapPin size={14} className="text-red-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Destination"
            value={dest}
            onChange={(e) => {
              setDest(e.target.value);
              setDestCoords(null);
              handleSearch(e.target.value, setDestSuggestions);
            }}
            className="bg-transparent outline-none text-white w-full text-xs placeholder-gray-500"
          />
        </div>
        {destSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-gray-700 rounded-lg overflow-hidden z-50 shadow-xl max-h-40 overflow-y-auto">
            {destSuggestions.map((s, i) => (
              <button key={i} onClick={() => { setDest(s.shortName); setDestCoords({ lat: s.lat, lng: s.lng }); setDestSuggestions([]); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 truncate">
                {s.shortName} <span className="text-gray-600">— {s.displayName.split(',').slice(1, 3).join(',')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Route Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange("fastest")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all
            ${routeMode === "fastest"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-dark-900 text-gray-500 border border-gray-800 hover:text-gray-300"}`}
        >
          <Route size={12} />
          Fastest
        </button>
        <button
          onClick={() => onModeChange("safest")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all
            ${routeMode === "safest"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-dark-900 text-gray-500 border border-gray-800 hover:text-gray-300"}`}
        >
          <Shield size={12} />
          Safest
        </button>
      </div>

      {/* Search Button */}
      <button
        onClick={doSearch}
        disabled={!from || !dest || loading}
        className="w-full py-2.5 rounded-xl btn-gradient flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
        ) : (
          <>
            <Search size={14} />
            Search Route
          </>
        )}
      </button>
    </div>
  );
}
