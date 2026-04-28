import { MapPin, Search, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { searchPlaces } from "../services/geocoding";

export default function SearchBox() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [destination, setDestination] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = (query, setSuggestions) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.length >= 2) {
        const results = await searchPlaces(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 400);
  };

  const handleFromChange = (e) => {
    setFrom(e.target.value);
    setFromCoords(null);
    handleSearch(e.target.value, setFromSuggestions);
  };

  const handleDestChange = (e) => {
    setDestination(e.target.value);
    setDestCoords(null);
    handleSearch(e.target.value, setDestSuggestions);
  };

  const selectFrom = (place) => {
    setFrom(place.shortName);
    setFromCoords({ lat: place.lat, lng: place.lng });
    setFromSuggestions([]);
  };

  const selectDest = (place) => {
    setDestination(place.shortName);
    setDestCoords({ lat: place.lat, lng: place.lng });
    setDestSuggestions([]);
  };

  const handleNavigate = () => {
    if (!from || !destination) return;
    setLoading(true);
    setTimeout(() => {
      navigate("/map", {
        state: {
          city: destination,
          from: from,
          fromCoords,
          destCoords,
        }
      });
    }, 300);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFrom("My Location");
        setFromCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFromSuggestions([]);
      },
      () => alert("Could not get your location. Please allow location access.")
    );
  };

  return (
    <div className="flex justify-center px-4 -mt-8 relative z-20">
      <div className="w-full max-w-2xl glass-card p-6 md:p-8 shadow-2xl shadow-black/30 animate-slide-up">

        <h2 className="text-xl font-bold text-white mb-1">Find Safe Routes</h2>
        <p className="text-gray-500 text-sm mb-6">Enter locations to discover the safest path</p>

        {/* From Input */}
        <div className="relative mb-4">
          <div className="flex items-center bg-dark-900 rounded-xl p-3.5 border border-gray-800 focus-within:border-orange-500/50 transition-colors">
            <MapPin size={18} className="text-green-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Enter starting location"
              value={from}
              onChange={handleFromChange}
              className="bg-transparent outline-none text-white w-full text-sm placeholder-gray-500"
            />
            <button
              onClick={useCurrentLocation}
              className="ml-2 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-cyan-400 transition shrink-0"
              title="Use my location"
            >
              <Navigation size={16} />
            </button>
          </div>
          {fromSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-xl">
              {fromSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectFrom(s)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition border-b border-gray-800/50 last:border-0"
                >
                  <span className="font-medium">{s.shortName}</span>
                  <span className="text-gray-500 text-xs block mt-0.5 truncate">{s.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="relative mb-6">
          <div className="flex items-center bg-dark-900 rounded-xl p-3.5 border border-gray-800 focus-within:border-orange-500/50 transition-colors">
            <MapPin size={18} className="text-red-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={handleDestChange}
              className="bg-transparent outline-none text-white w-full text-sm placeholder-gray-500"
            />
          </div>
          {destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-xl">
              {destSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectDest(s)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition border-b border-gray-800/50 last:border-0"
                >
                  <span className="font-medium">{s.shortName}</span>
                  <span className="text-gray-500 text-xs block mt-0.5 truncate">{s.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleNavigate}
          disabled={!from || !destination}
          className="w-full py-3.5 rounded-xl btn-gradient flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : (
            <>
              <Search size={18} />
              Search Route
            </>
          )}
        </button>
      </div>
    </div>
  );
}
