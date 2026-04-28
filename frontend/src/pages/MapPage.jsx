import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import RouteControls from "../components/RouteControls";
import RouteDisplay from "../components/RouteDisplay";
import CrimeFilters from "../components/CrimeFilters";
import SafetyScore from "../components/SafetyScore";
import SOSButton from "../components/SOSButton";
import { getRoute } from "../services/routing";
import { generateCrimeData, getHeatmapData } from "../utils/crimeData";
import { scoreRoute, rankRoutesBySafety } from "../utils/riskScoring";
import { CITY_COORDS } from "../utils/constants";

export default function MapPage() {
  const location = useLocation();
  const initFrom = location.state?.from || "";
  const initCity = location.state?.city || "";
  const initFromCoords = location.state?.fromCoords || null;
  const initDestCoords = location.state?.destCoords || null;

  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeMode, setRouteMode] = useState("fastest");
  const [loading, setLoading] = useState(false);
  const [sourceCoords, setSourceCoords] = useState(initFromCoords ? [initFromCoords.lat, initFromCoords.lng] : null);
  const [destCoords, setDestCoords] = useState(initDestCoords ? [initDestCoords.lat, initDestCoords.lng] : null);
  const [userLocation, setUserLocation] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [filters, setFilters] = useState({ type: "all", severity: 0, dateFrom: "", dateTo: "" });

  // Detect city for crime data
  const detectedCity = useMemo(() => {
    const city = initCity || "Delhi";
    return Object.keys(CITY_COORDS).find(c => c.toLowerCase() === city.toLowerCase()) || "Delhi";
  }, [initCity]);

  // Generate crime data
  const allCrimes = useMemo(() => generateCrimeData(detectedCity, 300), [detectedCity]);

  // Filter crimes
  const filteredCrimes = useMemo(() => {
    return allCrimes.filter(c => {
      if (filters.type !== "all" && c.type !== filters.type) return false;
      if (filters.severity > 0 && c.severity < filters.severity) return false;
      if (filters.dateFrom && c.date < filters.dateFrom) return false;
      if (filters.dateTo && c.date > filters.dateTo) return false;
      return true;
    });
  }, [allCrimes, filters]);

  const heatmapData = useMemo(() => showHeatmap ? getHeatmapData(filteredCrimes) : [], [filteredCrimes, showHeatmap]);
  const visibleMarkers = useMemo(() => showMarkers ? filteredCrimes.slice(0, 100) : [], [filteredCrimes, showMarkers]);

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

  // Resolve coords from city name
  const resolveCoords = useCallback((name, providedCoords) => {
    if (providedCoords) return [providedCoords.lat, providedCoords.lng];
    const found = Object.entries(CITY_COORDS).find(([k]) => k.toLowerCase() === name.toLowerCase());
    if (found) return [found[1].lat, found[1].lng];
    return null;
  }, []);

  // Initial search from navigation state
  useEffect(() => {
    if (initFrom && initCity) {
      const src = resolveCoords(initFrom, initFromCoords);
      const dst = resolveCoords(initCity, initDestCoords);
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
      const scored = rankRoutesBySafety(rawRoutes, allCrimes);
      // Mark safest
      if (scored.length > 0) scored[0].isSafest = true;
      setRoutes(scored);
      setSelectedRouteIndex(routeMode === "safest" ? 0 : scored.findIndex(r => !r.isSafest || scored.length === 1));
      if (routeMode === "safest") setSelectedRouteIndex(0);
      else setSelectedRouteIndex(scored.length > 1 ? scored.findIndex(r => r.routeIndex === 0) : 0);
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
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 p-4 space-y-4 overflow-y-auto lg:max-h-[calc(100vh-64px)]">
          <RouteControls
            onSearch={handleSearch}
            onModeChange={handleModeChange}
            routeMode={routeMode}
            loading={loading}
            initialFrom={initFrom}
            initialDest={initCity}
            initialFromCoords={initFromCoords}
            initialDestCoords={initDestCoords}
          />
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

        {/* Map */}
        <div className="flex-1 p-4 pt-0 lg:pt-4 min-h-[400px] lg:min-h-0">
          <div className="h-full min-h-[400px] lg:min-h-0 lg:h-[calc(100vh-96px)]">
            <MapView
              routes={routes}
              selectedRouteIndex={selectedRouteIndex}
              sourceCoords={sourceCoords}
              destCoords={destCoords}
              userLocation={userLocation}
              crimeMarkers={visibleMarkers}
              heatmapData={heatmapData}
            />
          </div>
        </div>
      </div>
      <SOSButton />
    </div>
  );
}
