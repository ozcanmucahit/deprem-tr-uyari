import { useState, useEffect,useRef } from 'react'
import Home from "./Home";
import { Routes, Route, Link } from "react-router-dom"
import mapboxgl from 'mapbox-gl';
  
function App() {
  const [deprem, setDeprem] = useState({ result: [] });
  const [loading, setLoading] = useState(false);
  const mapContainerRefs = useRef([]);


  mapboxgl.accessToken =
    "pk.eyJ1IjoiYXNkYXNkc2FkcXdlcXdxZXFlcXdlcXdlIiwiYSI6ImNrdXB4ejd3NzFocHEydXBmMWxvaHV1azEifQ.k6miKHXqAKN1wFPHBVQJrA";

  let controller;


  useEffect(() => {
    if (deprem.result.length > 0 && mapContainerRefs.current.length > 0) {
      mapContainerRefs.current.forEach((mapContainer, index) => {
        const { lng, lat } = deprem.result[index];
        const map = new mapboxgl.Map({
          container: mapContainer,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [lng, lat],
          zoom: 8,
        });

        new mapboxgl.Marker({ color: "#FF0000" })
          .setLngLat([lng, lat])
          .addTo(map);
      });
    }
  }, [deprem.result, mapContainerRefs])

  
  const DepremClick = async () => {
    controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    fetch("https://api.orhanaydogdu.com.tr/deprem/kandilli/live", { signal })
      .then((response) => response.json())
      .then((data) => {
        setDeprem({ result: data.result.slice(0, 10) });
        setLoading(false);
        console.log(JSON.stringify(data.result[0], null, 2));
      });
  };

  const DepremClickClose = async () => {
    setLoading(true);
    setCloseD(true);
    controller && controller.abort();
    console.log("deprem data is close ");
  };


  const notifyMe = () => {
  if (!("Notification" in window)) {
  } else if (Notification.permission === "granted") {
    const notification = new Notification("Bir deprem verisi !");
  } else if (Notification.permission !== "") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        const notification = new Notification("Bir deprem verisi !");
      }
    });
  }

}
  useEffect(() => {
    const interval = setInterval(() => {
      notifyMe()
    }, (1000 * 5) * (12*30));
    return () => {
        clearInterval(interval)      
    }
  },[])
  
  return (
    <div className="px-2 py-2 bg-gray-100">
      <div>
        <p className='text-center text-lg font-bold'>Tasarlayan Mücahit</p>
      </div>
    <div className="text-red-500 font-bold">
      <div className="flex  justify-between mb-2">
        <button
          onClick={DepremClick}
          className="bg-black text-white px-2 py-2"
        >
          Deprem Verileri Al
        </button>
        <button
          onClick={DepremClickClose}
          className="bg-red-800  text-white px-2 py-2 "
        >
          Deprem Verileri Kapat
        </button>
      </div>
      {loading ? (
  <div>Veriler yükleniyor...</div>
) : (
  <ul className=" text-black flex flex-col gap-y-8">
    {deprem.result.map((item, key) => (
      <div
        className="bg-white  shadow-sm text-center h-[500px] border rounded-lg"
        key={key}
      >
        <div className="translate-y-1/3 flex flex-col gap-y-2">
          <li className="text-black">
            Deprem Konumu: {item.title}
          </li>
          <li>
            Tarih:{" "}
            {new Date(item.date).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </li>
          <li>
            Saat:{" "}
            {new Date(item.date).toLocaleTimeString("tr-TR", {
              hour: "numeric",
              minute: "numeric",
            })}
          </li>
          <li>Şiddeti: {item.mag}</li>
          <li>Derinlik: {item.depth}</li>
          <li>Koordinatlar: {item.lat}, {item.lng}</li>
          <div
                  id={`map-${key}`}
                  className="map"
                  style={{ height: "300px" }}
                  ref={(el) => (mapContainerRefs.current[key] = el)}
                ></div>
        </div>
      </div>
    ))}
  </ul>
)}
      </div>
      <Routes>
      <Route path="/home" element={<Home />} />
      </Routes>
      </div>
);
}
 
 export default App;