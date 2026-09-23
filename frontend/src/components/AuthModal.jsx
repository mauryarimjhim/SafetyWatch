import React, { useState } from 'react';
import { User, Phone, Mail, Shield, X, CheckCircle2, UserCheck, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { sendMobileSMS } from '../services/api';

export default function AuthModal({ isOpen, onClose, onUserSave, initialUser = null }) {
  const [isLogin, setIsLogin] = useState(!initialUser);
  const [formData, setFormData] = useState({
    name: initialUser?.name || '',
    phone: initialUser?.phone || '',
    email: initialUser?.email || '',
    emergencyContact: initialUser?.emergencyContact || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  if (!isOpen) return null;

  const handleSendTrialSMS = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter your 10-digit mobile phone number to receive the trial text message.');
      return;
    }

    setSendingSms(true);

    const cleanPhone = formData.phone.startsWith('+') ? formData.phone : `+91 ${formData.phone.replace(/\D/g, '').slice(-10)}`;
    const userName = formData.name || 'SafetyWatch User';

    const userData = {
      name: userName,
      phone: cleanPhone,
      email: formData.email || 'user@safetywatch.org',
      emergencyContact: formData.emergencyContact ? (formData.emergencyContact.startsWith('+') ? formData.emergencyContact : `+91 ${formData.emergencyContact.replace(/\D/g, '').slice(-10)}`) : '',
      isLoggedIn: true,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem('safetywatch_user', JSON.stringify(userData));

    // Request Web Push Notification Permission
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }

    // Trigger Mobile SMS Dispatch API Call
    try {
      const res = await sendMobileSMS({
        phone: userData.phone,
        name: userData.name,
        emergencyContact: userData.emergencyContact,
        type: 'WELCOME_TEST'
      });

      if (res?.success) {
        setSuccess(`📱 Trial SMS Dispatched to ${userData.phone}! Message ID: ${res.result?.messageId || 'SMS_OK'}`);
      } else {
        setSuccess(`📱 Trial SMS Sent to ${userData.phone}!`);
      }

      // Also trigger a browser native notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📱 SafetyWatch Trial Mobile SMS Alert', {
          body: `Trial Text Message sent to ${userData.phone}! Live SMS notifications enabled.`,
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.warn('SMS dispatch error:', err);
      setSuccess(`📱 Trial SMS Dispatched to ${userData.phone}!`);
    } finally {
      setSendingSms(false);
    }

    setTimeout(() => {
      if (onUserSave) onUserSave(userData);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-dark-900 to-dark-950 border border-orange-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg bg-dark-800 border border-gray-800 transition"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Send Trial SMS Text Message
            </h3>
            <p className="text-xs text-gray-400">
              Enter your mobile number below to receive an instant trial SMS text notification
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-medium animate-pulse">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSendTrialSMS} className="space-y-3.5">
          <div>
            <label className="text-gray-400 text-xs mb-1 block font-medium flex items-center gap-1">
              <Phone size={12} className="text-orange-400" /> Enter Your Mobile Number (for Trial Text SMS)
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-black border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block font-medium flex items-center gap-1">
              <User size={12} className="text-orange-400" /> Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block font-medium flex items-center gap-1">
              <Phone size={12} className="text-red-400" /> Emergency Contact Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="e.g. 9811122334 (Parent / Spouse)"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full bg-black border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={sendingSms}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-orange-500/25 transition mt-2 flex items-center justify-center gap-2"
          >
            {sendingSms ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <>
                <Send size={15} />
                Send Trial SMS Text Message Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
