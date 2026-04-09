export default function FeatureCards() {

  // 🔥 24/7 LOGIC (simple for now)
  const hour = new Date().getHours();

  let risk = "Low";
  let color = "text-green-400";

  if (hour >= 20) {
    risk = "High";
    color = "text-red-400";
  } else if (hour >= 16) {
    risk = "Medium";
    color = "text-yellow-400";
  }

  return (
    <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Card 1 */}
      <div className="bg-[#111a2e] border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition">
        <h2 className="text-2xl font-bold text-green-400">Real-Time</h2>
        <p className="text-gray-400 mt-2">Live Crime Data</p>
      </div>

      {/* Card 2 */}
      <div className="bg-[#111a2e] border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition">
        <h2 className="text-2xl font-bold text-orange-400">AI-Powered</h2>
        <p className="text-gray-400 mt-2">Smart Predictions</p>
      </div>

      {/* Card 3 (Dynamic) */}
      <div className="bg-[#111a2e] border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition">
        <h2 className={`text-2xl font-bold ${color}`}>
          24/7 Monitoring
        </h2>

        <p className="text-gray-400 mt-2">
          Current Risk: <span className={color}>{risk}</span>
        </p>
      </div>

    </div>
  );
}