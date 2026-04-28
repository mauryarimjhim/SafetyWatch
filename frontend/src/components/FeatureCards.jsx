import { Activity, Brain, Eye, Shield } from "lucide-react";

export default function FeatureCards() {
  const hour = new Date().getHours();
  let risk = "Low";
  let riskColor = "text-green-400";
  let riskBg = "from-green-500/10 to-green-600/5";
  if (hour >= 20 || hour < 5) { risk = "High"; riskColor = "text-red-400"; riskBg = "from-red-500/10 to-red-600/5"; }
  else if (hour >= 16) { risk = "Medium"; riskColor = "text-yellow-400"; riskBg = "from-yellow-500/10 to-yellow-600/5"; }

  const features = [
    {
      icon: Activity,
      title: "Real-Time Tracking",
      desc: "Live GPS location monitoring with continuous safety updates",
      color: "text-cyan-400",
      gradient: "from-cyan-500/10 to-blue-600/5",
    },
    {
      icon: Brain,
      title: "ML Analytics",
      desc: "Machine learning powered crime prediction and pattern analysis",
      color: "text-purple-400",
      gradient: "from-purple-500/10 to-pink-600/5",
    },
    {
      icon: Eye,
      title: `24/7 Monitoring`,
      desc: <>Current Risk Level: <span className={`font-bold ${riskColor}`}>{risk}</span></>,
      color: riskColor,
      gradient: riskBg,
    },
    {
      icon: Shield,
      title: "Safe Routing",
      desc: "AI-optimized routes that avoid high-crime areas",
      color: "text-orange-400",
      gradient: "from-orange-500/10 to-red-600/5",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 mb-8">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-3">
        Powered by <span className="gradient-text">Intelligence</span>
      </h2>
      <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
        Advanced features that keep you safe and informed
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className={`group glass-card p-6 hover:scale-[1.03] transition-all duration-300 cursor-default animate-fade-in bg-gradient-to-br ${f.gradient}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <f.icon size={24} className={f.color} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
