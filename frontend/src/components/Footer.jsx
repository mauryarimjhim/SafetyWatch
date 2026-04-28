import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-gray-400 mt-20 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">SafetyWatch</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500">
            AI-powered crime prediction and safe navigation system.
            Stay safe, stay informed, stay protected.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigate</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/map", label: "Crime Map" },
              { to: "/analytics", label: "Analytics" },
              { to: "/emergency", label: "Emergency" },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-orange-400 transition-colors duration-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Emergency</h3>
          <ul className="space-y-3 text-sm">
            <li>🚓 Police: <a href="tel:100" className="text-white hover:text-orange-400 transition">100</a></li>
            <li>🚑 Ambulance: <a href="tel:102" className="text-white hover:text-orange-400 transition">102</a></li>
            <li>👮 Women Helpline: <a href="tel:1091" className="text-white hover:text-orange-400 transition">1091</a></li>
            <li>🚒 Fire: <a href="tel:101" className="text-white hover:text-orange-400 transition">101</a></li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Information</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-orange-400 cursor-pointer transition">About Us</li>
            <li className="hover:text-orange-400 cursor-pointer transition">Safety Tips</li>
            <li className="hover:text-orange-400 cursor-pointer transition">Privacy Policy</li>
            <li className="hover:text-orange-400 cursor-pointer transition">Contact</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800/50 text-center text-sm py-6 text-gray-600">
        <span>© {new Date().getFullYear()} SafetyWatch. All rights reserved.</span>
        <span className="mx-2">·</span>
        <span className="inline-flex items-center gap-1">
          Made with <span className="text-red-500 animate-pulse">❤️</span> for public safety
        </span>
      </div>
    </footer>
  );
}
