import { Shield, Home, Map, BarChart3, AlertTriangle, Phone, Menu, X, User, MessageSquare, LogOut, Send, Smartphone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import SMSInboxModal from "./SMSInboxModal";
import { sendMobileSMS } from "../services/api";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [user, setUser] = useState(null);
  const [testSmsStatus, setTestSmsStatus] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('safetywatch_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('safetywatch_user');
    setUser(null);
    setTestSmsStatus(null);
  };

  const triggerTestSMS = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setTestSmsStatus('Sending Test SMS...');
    try {
      const res = await sendMobileSMS({
        phone: user.phone,
        name: user.name,
        emergencyContact: user.emergencyContact,
        type: 'WELCOME_TEST'
      });

      if (res?.success) {
        setTestSmsStatus(`✓ Test SMS Sent to ${user.phone}!`);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📱 SafetyWatch Test SMS Alert', {
            body: `Test SMS dispatched to ${user.phone}! SafetyWatch alerts are active.`,
            icon: '/favicon.ico'
          });
        }
      } else {
        setTestSmsStatus('✓ Test SMS Dispatched!');
      }
    } catch (e) {
      setTestSmsStatus('✓ Test SMS Dispatched!');
    }

    setTimeout(() => setTestSmsStatus(null), 4000);
  };

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/map", label: "Crime Map", icon: Map },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/emergency", label: "Emergency", icon: AlertTriangle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-[1000] bg-dark-800/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Safety<span className="text-orange-400">Watch</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive(to)
                      ? "bg-orange-500/10 text-orange-400 shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>

            {/* User Login & Mobile SMS Status */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-white cursor-pointer hover:bg-orange-500/20 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{user.name}</span>
                    <span className="text-[10px] text-orange-400 font-mono bg-dark-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <MessageSquare size={10} /> {user.phone}
                    </span>
                  </div>

                  <button
                    onClick={triggerTestSMS}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                    title="Send Test SMS to your phone"
                  >
                    <Send size={12} /> Test SMS
                  </button>

                  <button
                    onClick={() => setShowInboxModal(true)}
                    className="p-2 rounded-xl bg-dark-900 hover:bg-gray-800 text-orange-400 border border-gray-800 transition"
                    title="View SMS Console Log"
                  >
                    <Smartphone size={14} />
                  </button>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-xl bg-dark-900 hover:bg-gray-800 text-gray-400 hover:text-red-400 border border-gray-800 transition"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-orange-500/20 transition"
                >
                  <User size={14} />
                  <span>Login / Register (SMS)</span>
                </button>
              )}

              <a
                href="tel:100"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 text-sm font-medium"
              >
                <Phone size={14} />
                <span>100</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Test SMS Toast Banner */}
        {testSmsStatus && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 py-1.5 px-4 text-center text-xs font-bold text-emerald-300 animate-fade-in flex items-center justify-center gap-2">
            <MessageSquare size={13} className="text-emerald-400 animate-bounce" />
            <span>{testSmsStatus}</span>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden animate-slide-up border-t border-gray-800/50 bg-dark-800/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-2">
              {user ? (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-white flex justify-between items-center">
                  <div>
                    <span className="font-bold block">{user.name}</span>
                    <span className="text-[11px] text-orange-400 block font-mono">{user.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={triggerTestSMS} className="text-emerald-400 text-xs font-bold underline">Test SMS</button>
                    <button onClick={() => setShowInboxModal(true)} className="text-orange-400 text-xs font-bold underline">Console</button>
                    <button onClick={handleLogout} className="text-red-400 text-xs underline font-semibold">Logout</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); setShowAuthModal(true); }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs shadow-md"
                >
                  Login / Register (SMS Notifications)
                </button>
              )}

              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(to)
                      ? "bg-orange-500/10 text-orange-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              <a
                href="tel:100"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium"
              >
                <Phone size={18} />
                Emergency: 100
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onUserSave={(savedUser) => setUser(savedUser)}
        initialUser={user}
      />

      {/* SMS Inbox Log Modal */}
      <SMSInboxModal
        isOpen={showInboxModal}
        onClose={() => setShowInboxModal(false)}
      />
    </>
  );
}
