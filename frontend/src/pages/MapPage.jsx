import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import RouteControls from "../components/RouteControls";
import RouteDisplay from "../components/RouteDisplay";
import CrimeFilters from "../components/CrimeFilters";
import SafetyScore from "../components/SafetyScore";
import SOSButton from "../components/SOSButton";
import MLRiskPredictor from "../components/MLRiskPredictor";
import { getRoute } from "../services/routing";
import { fetchCrimes, fetchKMeansClusters } from "../services/api";
import { scoreRoute, rankRoutesBySafety } from "../utils/riskScoring";
import { CITY_COORDS, NCR_CITIES } from "../utils/constants";
import { MapPin, Sparkles } from "lucide-react";

export default function MapPage() {
  const location = useLocation();
  const initFrom = location.state?.from || "";
  const initCity = location.state?.city || "Delhi";
  const initFromCoords = location.state?.fromCoords || null;
  const initDestCoords = location.state?.destCoords || null;

  const [activeCity, setActiveCity] = useState(initCity);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeMode, setRouteMode] = useState("fastest");
  const [loading, setLoading] = useState(false);
  const [sourceCoords, setSourceCoords] = useState(initFromCoords ? [initFromCoords.lat, initFromCoords.lng] : null);
  const [destCoords, setDestCoords] = useState(initDestCoords ? [initDestCoords.lat, initDestCoords.lng] : null);
  const [userLocation, setUserLocation] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showMLClusters, setShowMLClusters] = useState(true);
  const [filters, setFilters] = useState({ type: "all", severity: 0, dateFrom: "", dateTo: "" });

  const [crimes, setCrimes] = useState([]);
  const [mlClusters, setMlClusters] = useState([]);

  // Fetch live backend crimes and ML clusters for active city
  useEffect(() => {
    let isMounted = true;
    fetchCrimes(activeCity)
      .then(res => {
        if (isMounted && res.crimes) setCrimes(res.crimes);
      })
      .catch(err => console.warn('Crimes fetch error:', err));

    fetchKMeansClusters(activeCity, 6)
      .then(res => {
        if (isMounted && res.clusters) setMlClusters(res.clusters);
      })
      .catch(err => console.warn('Clusters fetch error:', err));

    return () => { isMounted = false; };
  }, [activeCity]);

  // Filter crimes
  const filteredCrimes = useMemo(() => {
    return crimes.filter(c => {
      const type = c.crime_type || c.type;
      if (filters.type !== "all" && type !== filters.type) return false;
      if (filters.severity > 0 && (c.severity || 3) < filters.severity) return false;
      if (filters.dateFrom && c.date < filters.dateFrom) return false;
      if (filters.dateTo && c.date > filters.dateTo) return false;
      return true;
    });
  }, [crimes, filters]);

  const heatmapData = useMemo(() => {
    if (!showHeatmap) return [];
    return filteredCrimes.map(c => [
      c.latitude !== undefined ? c.latitude : c.lat,
      c.longitude !== undefined ? c.longitude : c.lng,
      (c.severity || 3) / 5
    ]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
  }, [filteredCrimes, showHeatmap]);

  const visibleMarkers = useMemo(() => {
    if (!showMarkers) return [];
    return filteredCrimes.slice(0, 150).map(c => ({
      ...c,
      lat: c.latitude !== undefined ? c.latitude : c.lat,
      lng: c.longitude !== undefined ? c.longitude : c.lng,
      type: c.crime_type || c.type || 'Theft'
    }));
  }, [filteredCrimes, showMarkers]);

  // GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const resolveCoords = useCallback((name, providedCoords) => {
    if (providedCoords) return [providedCoords.lat, providedCoords.lng];
    const found = Object.entries(CITY_COORDS).find(([k]) => k.toLowerCase() === name.toLowerCase());
    if (found) return [found[1].lat, found[1].lng];
    return null;
  }, []);

  useEffect(() => {
    if (initFrom && activeCity) {
      const src = resolveCoords(initFrom, initFromCoords);
      const dst = resolveCoords(activeCity, initDestCoords);
      if (src && dst) {
        setSourceCoords(src);
        setDestCoords(dst);
        fetchRoutes(src, dst);
      }
    }
  }, []);

  const fetchRoutes = async (src, dst) => {
    setLoading(true);
    try {
      const rawRoutes = await getRoute(src[0], src[1], dst[0], dst[1], true);
      const scored = rankRoutesBySafety(rawRoutes, crimes);
      if (scored.length > 0) scored[0].isSafest = true;
      setRoutes(scored);
      setSelectedRouteIndex(routeMode === "safest" ? 0 : scored.findIndex(r => !r.isSafest || scored.length === 1));
    } catch (err) {
      console.error("Route error:", err);
    }
    setLoading(false);
  };

  const handleSearch = ({ from, dest, fromCoords, destCoords: dc }) => {
    const src = resolveCoords(from, fromCoords);
    const dst = resolveCoords(dest, dc);
    if (src && dst) {
      setSourceCoords(src);
      setDestCoords(dst);
      fetchRoutes(src, dst);
    } else {
      alert("Could not resolve location coordinates. Please select from suggestions.");
    }
  };

  const handleModeChange = (mode) => {
    setRouteMode(mode);
    if (routes.length > 0) {
      if (mode === "safest") setSelectedRouteIndex(0);
      else {
        const fastestIdx = routes.findIndex(r => r.routeIndex === 0);
        setSelectedRouteIndex(fastestIdx >= 0 ? fastestIdx : 0);
      }
    }
  };

  const selectedRoute = routes[selectedRouteIndex];

  return (
    <div className="bg-dark-900 min-h-screen flex flex-col">
      <Navbar />

      {/* NCR Territory Switcher Bar */}
      <div className="bg-dark-950 border-b border-gray-800 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles size={14} className="text-orange-400" />
          <span className="text-xs font-bold text-white">NCR Map Focus:</span>
        </div>
        <div className="flex items-center gap-1">
          {NCR_CITIES.map(c => (
            <button
              key={c}
              onClick={() => {
                setActiveCity(c);
                const coords = CITY_COORDS[c];
                if (coords) setDestCoords([coords.lat, coords.lng]);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                activeCity === c
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <MapPin size={10} /> {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowMLClusters(!showMLClusters)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
            showMLClusters
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
              : 'bg-dark-900 text-gray-500 border border-gray-800'
          }`}
        >
          🧠 ML K-Means Danger Zones ({mlClusters.length})
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-96 shrink-0 p-4 space-y-4 overflow-y-auto lg:max-h-[calc(100vh-110px)]">
          <RouteControls
            onSearch={handleSearch}
            onModeChange={handleModeChange}
            routeMode={routeMode}
            loading={loading}
            initialFrom={initFrom}
            initialDest={activeCity}
            initialFromCoords={initFromCoords}
            initialDestCoords={initDestCoords}
          />

          <MLRiskPredictor currentCity={activeCity} />

          {selectedRoute && <SafetyScore score={selectedRoute.safetyScore || 0} label={selectedRoute.safetyRating} />}
          <RouteDisplay routes={routes} selectedIndex={selectedRouteIndex} onSelectRoute={setSelectedRouteIndex} />
          <CrimeFilters
            filters={filters}
            onFilterChange={setFilters}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
            showMarkers={showMarkers}
            onToggleMarkers={() => setShowMarkers(!showMarkers)}
            crimeCount={filteredCrimes.length}
          />
        </div>

        {/* Map View */}
        <div className="flex-1 p-4 pt-0 lg:pt-4 min-h-[450px] lg:min-h-0">
          <div className="h-full min-h-[450px] lg:min-h-0 lg:h-[calc(100vh-140px)]">
            <MapView
              routes={routes}
              selectedRouteIndex={selectedRouteIndex}
              sourceCoords={sourceCoords}
              destCoords={destCoords}
              userLocation={userLocation}
              crimeMarkers={visibleMarkers}
              heatmapData={heatmapData}
              dangerZones={showMLClusters ? mlClusters : []}
            />
          </div>
        </div>
      </div>
      <SOSButton />
    </div>
  );
}
