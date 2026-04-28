import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EmergencyPage from "./pages/EmergencyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/emergency" element={<EmergencyPage />} />
    </Routes>
  );
}
