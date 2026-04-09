import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBox from "../components/SearchBox";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="bg-[#0B1220] min-h-screen">
      <Navbar />
      <Hero />
      <SearchBox />
      <FeatureCard />
      <Footer />
    </div>
  );
}