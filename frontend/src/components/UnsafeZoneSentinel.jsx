import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bell, BellOff, Navigation, AlertTriangle, CheckCircle, X, MessageSquare } from 'lucide-react';
import { predictMLRisk, sendMobileSMS } from '../services/api';
import { reverseGeocode } from '../services/geocoding';

export default function UnsafeZoneSentinel({ onLocationDetected }) {
  const [active, setActive] = useState(false);
  const [permission, setPermission] = useState(Notification ? Notification.permission : 'default');
  const [userCoords, setUserCoords] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [lastNotifiedTime, setLastNotifiedTime] = useState(0);
  const [smsSentNotice, setSmsSentNotice] = useState(null);

  // Request Notification permission
  const enableSentinel = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setPermission(res);
    }
    setActive(true);
    triggerGPSCheck();
  };

  const disableSentinel = () => {
    setActive(false);
    setShowAlertModal(false);
  };

  const triggerGPSCheck = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords([lat, lng]);

        // Reverse geocode
        const geo = await reverseGeocode(lat, lng);
        const name = geo?.shortName || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        setLocationName(name);
        if (onLocationDetected) onLocationDetected({ lat, lng, name, city: geo?.displayName });

        // Run ML Risk Classifier for live location
        try {
          const res = await predictMLRisk({ lat, lng, hour: new Date().getHours() });
          if (res?.prediction) {
            setRiskData(res.prediction);

            // If risk index >= 68%, trigger unsafe zone notification & mobile SMS
            if (res.prediction.predicted_risk_index >= 68) {
              triggerUnsafeAlert(name, res.prediction);
            }
          }
        } catch (e) {
          console.warn('Sentinel ML error:', e);
        }
      },
      (err) => {
        console.warn('GPS error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Continuous tracking when active
  useEffect(() => {
    if (!active || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords([lat, lng]);

        try {
          const res = await predictMLRisk({ lat, lng, hour: new Date().getHours() });
          if (res?.prediction) {
            setRiskData(res.prediction);
            if (res.prediction.predicted_risk_index >= 68) {
              const now = Date.now();
              if (now - lastNotifiedTime > 180000) { // minimum 3 mins interval
                const geo = await reverseGeocode(lat, lng);
                const name = geo?.shortName || 'Current Area';
                triggerUnsafeAlert(name, res.prediction);
                setLastNotifiedTime(now);
              }
            }
          }
        } catch (e) {}
      },
      null,
      { enableHighAccuracy: true, maximumAge: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [active, lastNotifiedTime]);

  const triggerUnsafeAlert = async (place, prediction) => {
    setShowAlertModal(true);

    // Get logged-in user info for Mobile SMS
    const savedUserRaw = localStorage.getItem('safetywatch_user');
    const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

    const userPhone = savedUser?.phone || '+91 98765 43210';
    const userName = savedUser?.name || 'SafetyWatch User';
    const emergencyContact = savedUser?.emergencyContact || '';

    // Dispatch Mobile SMS Text Message Notification
    try {
      const smsRes = await sendMobileSMS({
        phone: userPhone,
        name: userName,
        area: place,
        riskScore: prediction.predicted_risk_index,
        emergencyContact,
        type: 'UNSAFE_ZONE'
      });

      if (smsRes?.success) {
        setSmsSentNotice(`SMS Notification sent to ${userPhone}${emergencyContact ? ' & Emergency Contact (' + emergencyContact + ')' : ''}`);
      }
    } catch (e) {
      console.warn('SMS send error:', e);
    }

    // Trigger browser native Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('⚠️ SafetyWatch Unsafe Zone Warning!', {
          body: `High Risk Area Detected near ${place}! Risk Index: ${prediction.predicted_risk_index}/100. Follow safety instructions.`,
          icon: '/favicon.ico',
          tag: 'unsafe-zone-alert'
        });
      } catch (e) {
        console.warn('Browser notification blocked:', e);
      }
    }
  };

  return (
    <>
      {/* Sentinel Toggle Control Card */}
      <div className="glass-card p-4 rounded-xl border border-orange-500/30 bg-gradient-to-r from-dark-900 to-dark-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${active ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            {active ? <Bell size={18} /> : <BellOff size={18} />}
          </div>
          <div>
            <div className="text-white text-xs font-bold flex items-center gap-2">
              GPS Live Unsafe Zone Sentinel (Mobile SMS Active)
              {active && (
                <span className="text-[10px] bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full border border-red-500/30">
                  ● ACTIVE TRACKING
                </span>
              )}
            </div>
            <p className="text-gray-400 text-[11px]">
              {locationName ? `Live Location: ${locationName}` : 'Monitors live GPS position and sends SMS text alerts to your mobile number'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerGPSCheck}
            className="px-3 py-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-xs text-orange-400 font-semibold border border-orange-500/30 flex items-center gap-1.5 transition"
          >
            <Navigation size={12} /> Scan My Location
          </button>

          {!active ? (
            <button
              onClick={enableSentinel}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-semibold hover:brightness-110 shadow-md shadow-red-500/20 flex items-center gap-1.5 transition"
            >
              <Bell size={12} /> Enable SMS Alerts
            </button>
          ) : (
            <button
              onClick={disableSentinel}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 transition"
            >
              Disable
            </button>
          )}
        </div>
      </div>

      {/* In-App Unsafe Zone Alert Modal */}
      {showAlertModal && riskData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-dark-900 to-dark-950 border-2 border-red-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-white">
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-dark-900 border border-gray-800"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-full bg-red-500/20 text-red-500 border border-red-500/40 animate-bounce">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-400">⚠️ UNSAFE ZONE ALERT</h3>
                <p className="text-xs text-gray-300">Live GPS Sentinel & SMS Warning</p>
              </div>
            </div>

            {smsSentNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs flex items-center gap-2 font-medium">
                <MessageSquare size={14} className="shrink-0 text-orange-400" />
                <span>{smsSentNotice}</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-300">Current Area:</span>
                <span className="text-xs font-bold text-white">{locationName || 'Unsafe Zone'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-300">Calculated Risk Index:</span>
                <span className="text-lg font-black text-red-400">{riskData.predicted_risk_index}/100</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-orange-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert size={14} /> MANDATORY SAFETY INSTRUCTIONS:
            </h4>
            <ul className="space-y-2 mb-6">
              {(riskData.safety_recommendations || [
                'Avoid isolated roads and poorly lit alleyways.',
                'Keep phone accessible and SafetyWatch SOS button ready.',
                'Move towards well-populated arterial commercial streets.'
              ]).map((inst, i) => (
                <li key={i} className="text-xs text-gray-200 flex items-start gap-2 bg-dark-900 p-2 rounded-lg border border-gray-800">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition"
              >
                Acknowledge Warning
              </button>
              <a
                href="tel:112"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 text-xs font-bold text-white text-center shadow-lg shadow-red-500/30 transition flex items-center justify-center gap-1.5"
              >
                📞 Emergency Call 112
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
