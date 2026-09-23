import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, MapPin, X, Loader2 } from 'lucide-react';
import { searchPlaces, reverseGeocode } from '../services/geocoding';

export default function AnalyticsLocationSearch({ onSelectLocation, currentLocationName = 'Delhi' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search for places
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (place) => {
    setShowDropdown(false);
    setQuery(place.shortName);

    // Extract city name if possible
    let city = 'Delhi';
    const displayLower = place.displayName.toLowerCase();
    if (displayLower.includes('noida') && !displayLower.includes('greater')) city = 'Noida';
    else if (displayLower.includes('greater noida')) city = 'Greater Noida';
    else if (displayLower.includes('gurugram') || displayLower.includes('gurgaon')) city = 'Gurugram';
    else if (displayLower.includes('ghaziabad')) city = 'Ghaziabad';
    else if (displayLower.includes('faridabad')) city = 'Faridabad';
    else city = 'Delhi';

    if (onSelectLocation) {
      onSelectLocation({
        name: place.shortName,
        displayName: place.displayName,
        city,
        lat: place.lat,
        lng: place.lng
      });
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geo = await reverseGeocode(lat, lng);

        const placeName = geo?.shortName || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        setQuery(placeName);

        let city = 'Delhi';
        if (geo?.displayName) {
          const dl = geo.displayName.toLowerCase();
          if (dl.includes('noida') && !dl.includes('greater')) city = 'Noida';
          else if (dl.includes('greater noida')) city = 'Greater Noida';
          else if (dl.includes('gurugram') || dl.includes('gurgaon')) city = 'Gurugram';
          else if (dl.includes('ghaziabad')) city = 'Ghaziabad';
          else if (dl.includes('faridabad')) city = 'Faridabad';
        }

        setGpsLoading(false);
        if (onSelectLocation) {
          onSelectLocation({
            name: placeName,
            displayName: geo?.displayName || placeName,
            city,
            lat,
            lng,
            isGps: true
          });
        }
      },
      (err) => {
        setGpsLoading(false);
        alert('Could not access live GPS location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <div className="flex items-center gap-2 glass-card p-2 pl-4 rounded-2xl border border-gray-800 focus-within:border-orange-500/50 shadow-xl bg-dark-900/90">
        <Search size={18} className="text-orange-400 shrink-0" />
        <input
          type="text"
          placeholder="Search place, station, or landmark in NCR (e.g. Karol Bagh, Sector 18 Noida)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          className="bg-transparent outline-none text-white text-xs sm:text-sm flex-1 placeholder-gray-500 font-medium"
        />

        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); }}
            className="text-gray-500 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        )}

        {loading && <Loader2 size={16} className="animate-spin text-orange-400" />}

        {/* Live GPS Button */}
        <button
          onClick={handleUseGPS}
          disabled={gpsLoading}
          className="btn-gradient text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 shadow-md shadow-orange-500/20"
        >
          {gpsLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Navigation size={13} className="animate-pulse" />
          )}
          <span>Live GPS</span>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-950/95 backdrop-blur-md border border-gray-800 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto divide-y divide-gray-800/60">
          {suggestions.map((place, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(place)}
              className="w-full text-left px-4 py-3 hover:bg-orange-500/10 transition flex items-start gap-2.5 text-xs text-white"
            >
              <MapPin size={14} className="text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-gray-200">{place.shortName}</span>
                <span className="text-[10px] text-gray-400 truncate block max-w-md">{place.displayName}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
