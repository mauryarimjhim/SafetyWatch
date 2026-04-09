import { Shield } from "lucide-react";

export default function Hero() {
  return (
    <div className="bg-[#0B1220] text-white text-center py-20 px-4">

      {/* 🔵 3D Blue Shield */}
      <div className="flex justify-center mb-6">
        <div className="
          p-6 rounded-full 
          bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900
          shadow-[inset_0_4px_10px_rgba(255,255,255,0.2),0_10px_40px_rgba(0,0,50,0.9)]
          hover:scale-110 transition duration-300
        ">
          <Shield 
            size={40} 
            className="text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* 🔥 Gradient Title */}
      <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
        Delhi Crime Prediction
      </h1>

      {/* Subtitle */}
      <h2 className="text-2xl mt-4 font-semibold">
        Safe Route Map
      </h2>

      {/* Description */}
      <p className="mt-4 text-gray-400 max-w-xl mx-auto">
        Navigate Delhi safely with AI-powered crime prediction and intelligent route planning
      </p>

    </div>
  );
}