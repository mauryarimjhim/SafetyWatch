import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {useRef, useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function CrimeMap({ city, from }) {
  const navigate = useNavigate();
  const mapRef =useRef();

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !city) 
      return;
  
   const timer = setTimeout(()=>{
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(28.6139, 77.209), // Delhi Center
        L.latLng(
          city === "Noida" ? 28.5355 : 28.7041,
          city === "Noida" ? 77.391 : 77.1025,
        ),
      ],
      routeWhileDragging: false,
      show:false,
      addWaypoints: false,
    }).addTo(map);
  },500);

    return () => {
      clearTimeout(timer);
      if(routingControl){
        try{
          map.removeControl(routingControl);
        } catch (error) {}
      }
    };
  }, [city]);

   
  return (
    <div className="mt-16 px-6">
      {/* Title */}
      <h2 className="text-3xl font-bold text-white text-center mb-2">
        Crime Map Visualization
      </h2>

      <p className="text-gray-400 text-center mb-6">
        Analyze crime-prone areas and safer zones across Delhi
      </p>

      {/* Map Wrapper */}
      <div className="max-w-6xl mx-auto relative">
        {/* 🔥 Top Info Bar */}
        <div
          className="
          absolute top-4 left-1/2 transform -translate-x-1/2 
          bg-black/70 backdrop-blur-md 
          px-6 py-2 rounded-full text-sm text-white z-[1000]
          shadow-lg
        "
        >
          Live Crime Monitoring • Delhi
        </div>

        {/* Map */}
        <div
          className="
          h-[500px] 
          rounded-2xl 
          overflow-hidden 
          border border-gray-700 
          shadow-[0_0_30px_rgba(255,100,0,0.1)]
        "
        >
          <MapContainer
            center={ [28.6139, 77.209] }
            zoom={11}
            className="h-full w-full"
            whenCreated={(map)=>{mapRef.current = map;}}
          >
            <TileLayer
                 url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <Marker position={[28.6139, 77.209]}>
              <Popup>
                <div className="text-center">
                  <p className="mb-2 font-semibold ">{city}</p>
                  <button
                    onClick={() =>
                      navigate("/analytics", { state: { location: city } })
                    }
                    className="bg-orange-500 text-white px-3 py-1 rounded"
                  >
                    View Analytics
                  </button>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* 🔥 Legend */}
        <div
          className="
          absolute bottom-4 right-4 
          bg-black/70 backdrop-blur-md 
          p-4 rounded-xl text-sm text-white z-[1000]
        "
        >
          <p className="font-semibold mb-2">Risk Levels</p>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Low Risk
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Medium Risk
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            High Risk
          </div>
        </div>
      </div>
    </div>
  );
}
