import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B1220] text-gray-400 mt-20 border-t border-gray-800">
      
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Column 1 */}
        <div>
          <div className="flex items-center gap-2 text-white font-semibold text-lg mb-4">
            <Shield className="text-orange-500" />
            Delhi SafeRoute
          </div>
          <p className="text-sm leading-relaxed">
            AI-powered crime prediction and safe navigation system for Delhi.
            Stay safe, stay informed.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-orange-400 cursor-pointer">Home</li>
            <li className="hover:text-orange-400 cursor-pointer">Crime Map</li>
            <li className="hover:text-orange-400 cursor-pointer">Analytics</li>
            <li className="hover:text-orange-400 cursor-pointer">Emergency</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Emergency</h3>
          <ul className="space-y-2 text-sm">
            <li>🚓 Police: <span className="text-white">100</span></li>
            <li>🚑 Ambulance: <span className="text-white">102</span></li>
            <li>👮 Women Helpline: <span className="text-white">1091</span></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Information</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-orange-400 cursor-pointer">About Us</li>
            <li className="hover:text-orange-400 cursor-pointer">Safety Tips</li>
            <li className="hover:text-orange-400 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-orange-400 cursor-pointer">Contact</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-800 text-center text-sm py-4 text-gray-500 flex flex-col md:flex-row items-center justify-center gap-2">
  
  <span>
    © {new Date().getFullYear()} Delhi SafeRoute. All rights reserved.
  </span>

  <span className="hidden md:inline">|</span>

  <span className="flex items-center gap-1">
    Made with 
    <span className="text-red-500 animate-pulse">❤️</span> 
    for Delhi Safety
  </span>

</div>
    </footer>
  );
}