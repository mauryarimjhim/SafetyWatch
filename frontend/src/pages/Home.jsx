import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBox from "../components/SearchBox";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";
import SOSButton from "../components/SOSButton";

export default function Home() {
  return (
    <div className="bg-dark-900 min-h-screen">
      <Navbar />
      <Hero />
      <SearchBox />
      <FeatureCards />
      <Footer />
      <SOSButton />
    </div>
  );
}
