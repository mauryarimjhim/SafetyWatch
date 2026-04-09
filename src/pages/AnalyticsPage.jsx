import Navbar from "../components/Navbar";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from "recharts";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AnalyticsPage() {

  // 🔥 Get location from SearchBox
  const location = useLocation();
  const defaultCity = location.state?.location || "Delhi";

  // 🔥 State
  const [city, setCity] = useState(defaultCity);
  const [inputCity, setInputCity] = useState("");
  const [data, setData] = useState(null);

  // 🔥 Fetch from backend
  useEffect(() => {
    fetch(`http://localhost:5000/analytics?city=${city}`)
      .then(res => res.json())
      .then(result => setData(result))
      .catch(err => console.log(err));
  }, [city]);

  // 🔥 Loading state
  if (!data) {
    return (
      <div className="bg-[#0B1220] min-h-screen text-white">
        <Navbar />
        <p className="text-center mt-10">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B1220] min-h-screen text-white">
      
      <Navbar />

      {/* Heading */}
      <h1 className="text-3xl font-bold text-center mt-8">
        Crime Analytics Dashboard
      </h1>

      {/* 🔍 Search Bar */}
      <div className="flex justify-center mt-6">
        <input
          type="text"
          placeholder="Enter city (Delhi, Noida...)"
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          className="bg-gray-800 text-white p-3 rounded-lg w-full max-w-md outline-none"
        />

        <button
          onClick={() => setCity(inputCity)}
          className="ml-3 px-5 bg-orange-500 rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Showing city */}
      <h2 className="text-center mt-4 text-orange-400 text-lg">
        Showing data for: {city}
      </h2>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-6 mt-10">

        {/* Pie Chart */}
        <div className="bg-[#111a2e] p-6 rounded-xl">
          <h2 className="mb-4 font-semibold">Crime Distribution</h2>
          <PieChart width={300} height={300}>
            <Pie data={data.pie} dataKey="value" outerRadius={100}>
              {data.pie.map((entry, index) => (
                <Cell
                  key={index}
                  fill={["#f97316", "#ef4444", "#22c55e", "#3b82f6"][index]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Line Chart */}
        <div className="bg-[#111a2e] p-6 rounded-xl">
          <h2 className="mb-4 font-semibold">Crime Trend</h2>
          <LineChart width={300} height={300} data={data.line}>
            <XAxis dataKey="month" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="crimes" stroke="#f97316" />
          </LineChart>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#111a2e] p-6 rounded-xl md:col-span-2">
          <h2 className="mb-4 font-semibold">Area Comparison</h2>
          <BarChart width={600} height={300} data={data.bar}>
            <XAxis dataKey="area" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="crimes" fill="#f97316" />
          </BarChart>
        </div>

      </div>
    </div>
  );
}