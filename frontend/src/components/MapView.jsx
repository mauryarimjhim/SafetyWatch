import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons
const createIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "><div style="
      width: 10px; height: 10px; border-radius: 50%; background: white;
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(45deg);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

const sourceIcon = createIcon("#22c55e");
const destIcon = createIcon("#ef4444");
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="position:relative">
    <div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3)"></div>
    <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(59,130,246,0.4);animation:sosPulseRing 2s ease-out infinite"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Auto-fit map bounds with strict validation and try-catch safety
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds || bounds.length < 2) return;

    const validBounds = bounds.filter(p =>
      Array.isArray(p) &&
      p.length >= 2 &&
      typeof p[0] === 'number' && !isNaN(p[0]) &&
      typeof p[1] === 'number' && !isNaN(p[1])
    );

    if (validBounds.length >= 2) {
      try {
        map.fitBounds(validBounds, { padding: [50, 50], maxZoom: 14 });
      } catch (err) {
        console.warn("fitBounds skipped:", err);
      }
    }
  }, [map, bounds]);
  return null;
}

export default function MapView({
  routes = [],
  selectedRouteIndex = 0,
  sourceCoords,
  destCoords,
  userLocation,
  crimeMarkers = [],
  heatmapData = [],
  dangerZones = [],
  onMapReady,
  children,
}) {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const isValidCoord = (c) => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && !isNaN(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]);

  const validSource = isValidCoord(sourceCoords) ? sourceCoords : null;
  const validDest = isValidCoord(destCoords) ? destCoords : null;
  const validUser = isValidCoord(userLocation) ? userLocation : null;

  const center = validSource || validDest || validUser || [28.6139, 77.2090];

  // Calculate bounds
  const bounds = [];
  if (validSource) bounds.push(validSource);
  if (validDest) bounds.push(validDest);
  if (validUser && bounds.length === 0) bounds.push(validUser);

  // Heatmap layer with dimension check and exception safety
  useEffect(() => {
    if (!mapRef.current || !heatmapData.length || !mapLoaded) return;

    let timer = null;

    import("leaflet.heat").then(() => {
      timer = setTimeout(() => {
        if (!mapRef.current) return;
        const size = mapRef.current.getSize();
        if (!size || size.x === 0 || size.y === 0) return;

        try {
          if (heatLayerRef.current) {
            mapRef.current.removeLayer(heatLayerRef.current);
          }
          heatLayerRef.current = L.heatLayer(heatmapData, {
            radius: 25,
            blur: 20,
            maxZoom: 17,
            gradient: {
              0.1: "#22c55e",
              0.3: "#84cc16",
              0.5: "#eab308",
              0.7: "#f97316",
              1.0: "#ef4444",
            },
          }).addTo(mapRef.current);
        } catch (err) {
          console.warn("Heatmap render deferred:", err);
        }
      }, 100);
    });

    return () => {
      if (timer) clearTimeout(timer);
      if (heatLayerRef.current && mapRef.current) {
        try { mapRef.current.removeLayer(heatLayerRef.current); } catch {}
      }
    };
  }, [heatmapData, mapLoaded]);

  const handleReady = useCallback((e) => {
    mapRef.current = e.target;
    setMapLoaded(true);
    // Trigger Leaflet resize calculation
    setTimeout(() => {
      try { e.target.invalidateSize(); } catch {}
    }, 150);
    if (onMapReady) onMapReady(e.target);
  }, [onMapReady]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl shadow-black/30">
      <MapContainer
        center={center}
        zoom={11}
        className="h-full w-full"
        whenReady={handleReady}
        zoomControl={true}
      >
        {/* Standard Official OpenStreetMap TileLayer - Real-world street map, 100% Free, No API Key Required */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {bounds.length >= 2 && <FitBounds bounds={bounds} />}

        {/* Route polylines */}
        {routes.map((route, idx) => (
          <Polyline
            key={idx}
            positions={route.coordinates}
            pathOptions={{
              color: idx === selectedRouteIndex
                ? (route.isSafest ? "#16a34a" : "#2563eb")
                : "#4b5563",
              weight: idx === selectedRouteIndex ? 6 : 3,
              opacity: idx === selectedRouteIndex ? 0.95 : 0.5,
              dashArray: idx === selectedRouteIndex ? null : "10 6",
            }}
          />
        ))}

        {/* K-Means Danger Zones */}
        {dangerZones.map((dz) => (
          <Circle
            key={dz.zone_id}
            center={[dz.center_lat, dz.center_lng]}
            radius={dz.radius}
            pathOptions={{
              color: dz.color,
              fillColor: dz.color,
              fillOpacity: 0.28,
              weight: 2.5,
              dashArray: dz.risk_level === 'HIGH' ? '6 4' : null
            }}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900">{dz.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    dz.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {dz.risk_level} RISK
                  </span>
                </div>
                <div className="text-xs space-y-1 text-gray-700">
                  <div>🔥 Risk Score: <strong>{dz.avg_risk}/100</strong></div>
                  <div>📊 Cluster Crimes: <strong>{dz.crime_count} incidents</strong></div>
                  <div>🚨 Top Offense: <strong>{dz.top_crime}</strong></div>
                  <div>⏰ Peak Time: <strong>{dz.peak_hour}</strong></div>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Source marker */}
        {validSource && (
          <Marker position={validSource} icon={sourceIcon}>
            <Popup>
              <div className="text-center p-1">
                <span className="font-semibold text-sm">📍 Starting Point</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {validDest && (
          <Marker position={validDest} icon={destIcon}>
            <Popup>
              <div className="text-center p-1">
                <span className="font-semibold text-sm">🏁 Destination</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User GPS location */}
        {validUser && (
          <>
            <Marker position={validUser} icon={userIcon}>
              <Popup>
                <div className="text-center p-1">
                  <span className="font-semibold text-sm">📡 Your Location</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Crime markers */}
        {crimeMarkers.map((crime) => (
          <Marker
            key={crime.id}
            position={[crime.lat, crime.lng]}
            icon={L.divIcon({
              className: "crime-dot",
              html: `<div style="width:10px;height:10px;border-radius:50%;background:${
                crime.severity >= 4 ? "#dc2626" : crime.severity >= 3 ? "#ea580c" : "#ca8a04"
              };border:1.5px solid white;box-shadow:0 0 8px ${
                crime.severity >= 4 ? "#dc2626" : crime.severity >= 3 ? "#ea580c" : "#ca8a04"
              }"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            })}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="font-bold mb-1 text-gray-900">{crime.type}</div>
                <div className="text-xs space-y-1 text-gray-700">
                  <div>📍 {crime.area || crime.station}</div>
                  <div>📅 {crime.date} at {crime.time}</div>
                  <div>⚠️ Risk Score: <span className="font-semibold">{crime.risk_score || 50}</span></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {children}
      </MapContainer>
    </div>
  );
}
