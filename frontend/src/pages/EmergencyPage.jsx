import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SOSButton from "../components/SOSButton";
import { HELPLINES } from "../utils/constants";
import { fetchPoliceStations } from "../services/api";
import { Phone, MapPin, Navigation, AlertTriangle, Shield, Loader, ExternalLink } from "lucide-react";

export default function EmergencyPage() {
  const [userLoc, setUserLoc] = useState(null);
  const [stations, setStations] = useState([]);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [trackHistory, setTrackHistory] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) { setLoadingLoc(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(loc);
        setLoadingLoc(false);
        fetchPoliceStations(loc[0], loc[1]).then(setStations).catch(() => {});
      },
      () => setLoadingLoc(false),
      { enableHighAccuracy: true }
    );
  }, []);

  // Real-time tracking
  useEffect(() => {
    if (!tracking || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(loc);
        setTrackHistory(prev => [...prev, { lat: loc[0], lng: loc[1], time: new Date().toLocaleTimeString() }]);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [tracking]);

  return (
    <div className="bg-dark-900 min-h-screen text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black">
            <span className="gradient-text">Emergency</span> Center
          </h1>
          <p className="text-gray-500 mt-2">Quick access to emergency services and safety tools</p>
        </div>

        {/* Location & GPS Tracker */}
        <div className="glass-card p-5 mb-6 bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Navigation size={20} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">GPS Location</div>
                {loadingLoc ? (
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Loader size={10} className="animate-spin" /> Detecting...</div>
                ) : userLoc ? (
                  <div className="text-xs text-gray-400">{userLoc[0].toFixed(5)}, {userLoc[1].toFixed(5)}</div>
                ) : (
                  <div className="text-xs text-red-400">Location unavailable</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTracking(!tracking)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${tracking ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-dark-700 text-gray-400 border border-gray-700 hover:text-white"}`}>
                {tracking ? "● Live Tracking ON" : "Start Live Tracking"}
              </button>
              {userLoc && (
                <a href={`https://www.google.com/maps?q=${userLoc[0]},${userLoc[1]}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-dark-700 text-gray-400 hover:text-white border border-gray-700 transition">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          {tracking && trackHistory.length > 0 && (
            <div className="mt-4 max-h-28 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-2">Tracking History ({trackHistory.length} points)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {trackHistory.slice(-8).map((t, i) => (
                  <div key={i} className="bg-dark-900 rounded-lg px-2 py-1 text-[10px] text-gray-500">
                    <span className="text-green-400">●</span> {t.time} — {t.lat.toFixed(4)}, {t.lng.toFixed(4)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Helplines */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Phone size={16} className="text-orange-400" /> Emergency Helplines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {HELPLINES.map((h, i) => (
            <a key={i} href={`tel:${h.number}`}
              className="glass-card p-4 hover:scale-[1.03] transition-all duration-200 group animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{h.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{h.name}</div>
                  <div className="text-xs text-gray-500">{h.description}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-black" style={{ color: h.color }}>{h.number}</span>
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-green-500/20 transition">
                  <Phone size={14} className="text-gray-500 group-hover:text-green-400 transition" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Nearby Police Stations */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={16} className="text-blue-400" /> Nearby Police Stations
        </h2>
        {stations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((s, i) => (
              <div key={i} className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 shrink-0">
                    <Shield size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.address}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-cyan-400 flex items-center gap-1">
                        <MapPin size={10} /> {s.distance} km
                      </span>
                      <a href={`tel:${s.phone}`} className="text-xs text-green-400 flex items-center gap-1 hover:text-green-300">
                        <Phone size={10} /> {s.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-gray-500 text-sm">
            {loadingLoc ? "Detecting your location..." : "Enable location to find nearby stations"}
          </div>
        )}
      </div>
      <SOSButton />
    </div>
  );
}
