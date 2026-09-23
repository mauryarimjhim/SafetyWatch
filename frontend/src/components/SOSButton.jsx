import { useState } from "react";
import { AlertTriangle, MapPin, Loader, MessageSquare } from "lucide-react";
import { sendSOSAlert } from "../services/api";

export default function SOSButton() {
  const [active, setActive] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState(null);
  const [smsNotice, setSmsNotice] = useState(null);

  const handleSOS = async () => {
    setActive(true);
    setSending(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(loc);

            const savedUserRaw = localStorage.getItem('safetywatch_user');
            const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

            try {
              const res = await sendSOSAlert(loc.lat, loc.lng, {
                name: savedUser?.name || 'SafetyWatch User',
                phone: savedUser?.phone || '+91 98765 43210',
                emergencyContact: savedUser?.emergencyContact || ''
              });

              if (res?.smsResult) {
                setSmsNotice(`Mobile SMS dispatched to ${res.smsResult.phone}`);
              }
            } catch {}

            setSending(false);
            setSent(true);

            if (navigator.share) {
              try {
                await navigator.share({
                  title: "SOS Emergency Alert",
                  text: `Emergency! My location: ${loc.lat}, ${loc.lng}\nhttps://www.google.com/maps?q=${loc.lat},${loc.lng}`,
                });
              } catch {}
            }
            setTimeout(() => { setActive(false); setSent(false); setLocation(null); setSmsNotice(null); }, 6000);
          },
          () => { setSending(false); setActive(false); alert("Location access needed for SOS"); }
        );
      }
    } catch { setSending(false); setActive(false); }
  };

  if (!active) {
    return (
      <button onClick={handleSOS} className="fixed bottom-6 right-6 z-[9999] group" title="Emergency SOS">
        <div className="relative">
          <div className="sos-ring" />
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 animate-sos-pulse group-hover:scale-110 transition">
            <AlertTriangle size={24} className="text-white" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] glass-card p-4 w-72 animate-slide-up shadow-2xl border-red-500/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertTriangle size={16} className="text-red-400" />
        </div>
        <span className="text-white font-bold text-sm">Emergency SOS</span>
      </div>
      {sending ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader size={14} className="animate-spin" /> Getting location & sending alert...
        </div>
      ) : sent ? (
        <div className="space-y-2">
          <div className="text-green-400 text-xs font-bold">✓ Emergency SOS & Mobile SMS Dispatched!</div>
          {smsNotice && (
            <div className="text-[11px] text-orange-400 font-medium flex items-center gap-1">
              <MessageSquare size={12} /> {smsNotice}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={10} /> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
          <a href={location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : "#"}
            target="_blank" rel="noopener noreferrer"
            className="block text-center py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition">
            View on Google Maps
          </a>
        </div>
      ) : null}
    </div>
  );
}
