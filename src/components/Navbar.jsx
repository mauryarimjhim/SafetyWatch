import { Shield, Home, Map, BarChart3, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#0B1220] text-white border-b border-gray-800">

      {/* Logo */}
      <div className="flex items-center gap-2 text-orange-400 font-bold text-xl">
        <Shield className="text-orange-500" />
        SafetyWatch
      </div>

      {/* Links */}
      <div className="flex items-center gap-8 text-gray-300">

        <Link to="/" className="flex items-center gap-2 hover:text-orange-400 transition">
          <Home size={18} /> Home
        </Link>
              
        <Link to="/map" className="flex items-center gap-2 hover:text-orange-400 transition">
           <Map size={18} /> Crime Map
        </Link>

        <Link to="/analytics" className="flex items-center gap-2 hover:text-orange-400 transition">
          <BarChart3 size={18} /> Analytics
        </Link>

        <Link to="/emergency" className="flex items-center gap-2 hover:text-orange-400 transition">
          <AlertTriangle size={18} /> Emergency
        </Link>

      </div>
    </nav>
  );
}