import { Shield, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative bg-dark-800 text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center py-20 md:py-28 px-4">
        {/* Shield Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative p-5 rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-2xl shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
              <Shield size={44} className="text-white drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight">
          <span className="gradient-text">Smart Crime Map</span>
          <br />
          <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mt-2 block">
            & Safety Navigation
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          AI-powered crime prediction, intelligent safe routing,
          and real-time emergency tools — all in one platform
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/map"
            className="btn-gradient flex items-center gap-2 text-lg px-8 py-4 rounded-2xl"
          >
            <MapPin size={20} />
            Explore Crime Map
          </Link>
          <Link
            to="/emergency"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-gray-700 text-gray-300 hover:bg-white/5 hover:border-gray-500 transition-all duration-300 font-semibold text-lg"
          >
            <Zap size={20} />
            Emergency Tools
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {[
            { value: '500+', label: 'Crime Data Points' },
            { value: 'Real-time', label: 'GPS Tracking' },
            { value: 'ML', label: 'Powered Analytics' },
            { value: '24/7', label: 'Emergency Ready' },
          ].map((stat, i) => (
            <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
