import { Shield, Home, Map, BarChart3, AlertTriangle, Phone, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/map", label: "Crime Map", icon: Map },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/emergency", label: "Emergency", icon: AlertTriangle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
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

          {/* Emergency Quick Call */}
          <div className="hidden md:flex items-center gap-3">
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden animate-slide-up border-t border-gray-800/50 bg-dark-800/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
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
  );
}
