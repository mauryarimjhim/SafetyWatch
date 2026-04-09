import Navbar from "../components/Navbar";
import CrimeMap from "../components/CrimeMap";
import { useLocation } from "react-router-dom";

export default function MapPage() {
  const location =useLocation();
  const city = location.state?. locations || "Delhi";
  const from =location.state?.from ||"Delhi";

  return (
    <div className="bg-[#0B1220] min-h-screen">
      <Navbar />
      <CrimeMap city={city} from={from} />
    </div>
  );
}