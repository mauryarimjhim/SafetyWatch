import { MapPin }  from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState }   from  "react";

export default function SearchBox() {
 const navigate = useNavigate();
 const[from,setFrom]=useState("");
 const[destination ,setDestination]=useState("");
    return (
        <div className="flex justify-center mt-5 px-4">
           <div className="w-full max-w-3xl bg-white/5 backdrop-blur-lg 
        border border-gray-700 rounded-2xl p-6 shadow-lg" >
             <h2 className="text-xl font-semibold text-white  mb-4">Find Safest Route to your Destination</h2>
            
             {/*input1*/}
                <div className="flex items-center bg-gray-800 rounded-lg p-3 mb-4">
                 <MapPin className="text-gray-400 mr-2"/>
                  <input type="text" placeholder="Enter current location" value={from} onChange={(e)=> setFrom(e.target.value)} className="bg-transparent outline-none text-white w-full text-gray-400 focus:ring-2 focus:ring-orange-500 " />
                </div>
           
             {/*input2*/}
               <div className="flex items-center bg-gray-800 rounded-lg p-3 mb-4">
                 <MapPin className="text-gray-400 mr-2"/>
                 <input type="text" placeholder="Enter destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-transparent outline-none text-white w-full text-gray-400 focus:ring-2 focus:ring-orange-500" />
                 </div>
            
             {/*butto*/}

               <button onClick={()=>navigate("/map",
                  {state: {city:destination,
                     from:from
                  }})}
                   className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:scale-105 transition duration-300">
                  Search for safest route
               </button>
            </div>
          </div>
    )}
                
            