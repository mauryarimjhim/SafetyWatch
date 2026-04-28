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

// Auto-fit map bounds
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
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
  onMapReady,
  children,
}) {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const center = sourceCoords || userLocation || [28.6139, 77.2090];

  // Calculate bounds
  const bounds = [];
  if (sourceCoords) bounds.push(sourceCoords);
  if (destCoords) bounds.push(destCoords);
  if (userLocation && bounds.length === 0) bounds.push(userLocation);

  // Heatmap layer
  useEffect(() => {
    if (!mapRef.current || !heatmapData.length) return;

    // Dynamic import for leaflet.heat
    import("leaflet.heat").then(() => {
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
    });

    return () => {
      if (heatLayerRef.current && mapRef.current) {
        try { mapRef.current.removeLayer(heatLayerRef.current); } catch {}
      }
    };
  }, [heatmapData, mapLoaded]);

  const handleReady = useCallback((e) => {
    mapRef.current = e.target;
    setMapLoaded(true);
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {bounds.length >= 2 && <FitBounds bounds={bounds} />}

        {/* Route polylines */}
        {routes.map((route, idx) => (
          <Polyline
            key={idx}
            positions={route.coordinates}
            pathOptions={{
              color: idx === selectedRouteIndex
                ? (route.isSafest ? "#22c55e" : "#3b82f6")
                : "#4b5563",
              weight: idx === selectedRouteIndex ? 6 : 3,
              opacity: idx === selectedRouteIndex ? 0.9 : 0.4,
              dashArray: idx === selectedRouteIndex ? null : "10 6",
            }}
          />
        ))}

        {/* Risk segments overlay */}
        {routes[selectedRouteIndex]?.segments?.map((seg, i) =>
          seg.risk >= 40 ? (
            <Circle
              key={`risk-${i}`}
              center={[seg.lat, seg.lng]}
              radius={200}
              pathOptions={{
                color: seg.color,
                fillColor: seg.color,
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
          ) : null
        )}

        {/* Source marker */}
        {sourceCoords && (
          <Marker position={sourceCoords} icon={sourceIcon}>
            <Popup>
              <div className="text-center p-1">
                <span className="font-semibold text-sm">📍 Starting Point</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destCoords && (
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div className="text-center p-1">
                <span className="font-semibold text-sm">🏁 Destination</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User GPS location */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-center p-1">
                  <span className="font-semibold text-sm">📡 Your Location</span>
                  <br />
                  <span className="text-xs text-gray-400">
                    {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                  </span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.08,
                weight: 1,
              }}
            />
          </>
        )}

        {/* Crime markers */}
        {crimeMarkers.map((crime) => (
          <Marker
            key={crime.id}
            position={[crime.lat, crime.lng]}
            icon={L.divIcon({
              className: "crime-dot",
              html: `<div style="width:8px;height:8px;border-radius:50%;background:${
                crime.severity >= 4 ? "#ef4444" : crime.severity >= 3 ? "#f97316" : "#eab308"
              };opacity:0.7;box-shadow:0 0 6px ${
                crime.severity >= 4 ? "#ef4444" : crime.severity >= 3 ? "#f97316" : "#eab308"
              }"></div>`,
              iconSize: [8, 8],
              iconAnchor: [4, 4],
            })}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="font-bold mb-1">{crime.type}</div>
                <div className="text-xs space-y-1">
                  <div>📍 {crime.area}</div>
                  <div>📅 {crime.date} at {crime.time}</div>
                  <div>⚠️ Severity: <span className="font-semibold">{crime.severity}/5</span></div>
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
