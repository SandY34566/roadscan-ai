import { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const mapRef = useRef(null);       // 🔥 simpan map
  const markerRef = useRef(null);    // 🔥 simpan marker

  // 🗺️ INIT MAP
  useEffect(() => {
    setTimeout(() => {
      const container = document.getElementById("map");
      if (!container) return;

      if (mapRef.current) return; // cegah double init

      const map = L.map(container).setView([-6.4025, 106.7942], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // marker awal
      markerRef.current = L.marker([-6.4025, 106.7942])
        .addTo(map)
        .bindPopup("📍 Lokasi belum ditentukan");

      mapRef.current = map;
    }, 100);
  }, []);

  // 🚀 UPLOAD + PINDAH MARKER
  const upload = async () => {
    if (!file) return alert("Pilih gambar dulu!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post("http://127.0.0.1:8000/predict", formData);
      setResult(res.data);

      // 📡 ambil lokasi SETELAH scan
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          setLocation({ lat, lng });

          const map = mapRef.current;

          if (!map) return;

          // pindahkan view
          map.setView([lat, lng], 15);

          // 🔥 pindahkan marker (BUKAN tambah baru)
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            markerRef.current
              .bindPopup("📍 Lokasi Jalan Kamu")
              .openPopup();
          }
        },
        () => {
          alert("Gagal ambil lokasi!");
        }
      );
    } catch (err) {
      alert("Gagal koneksi ke backend!");
    } finally {
      setLoading(false);
    }
  };

  const getColor = () => {
    if (!result) return "";
    if (result.prediction === "Rusak") return "text-red-500";
    if (result.prediction === "Sedang") return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      
      <h1 className="text-2xl font-bold text-center mb-6">
        🚀 RoadScan AI
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* KIRI */}
        <div className="bg-gray-800 p-6 rounded-xl">
          
          <input
            type="file"
            className="mb-4"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />

          {preview && (
            <img
              src={preview}
              className="mb-4 w-full h-40 object-cover rounded"
            />
          )}

          <button
            onClick={upload}
            className="bg-blue-500 px-4 py-2 rounded w-full"
          >
            {loading ? "Scanning..." : "Scan Jalan"}
          </button>

          {result && (
            <div className="mt-4">
              <p>Kondisi:</p>
              <p className={`text-xl ${getColor()}`}>
                {result.prediction}
              </p>

              {location && (
                <p className="mt-2 text-sm text-gray-300">
                  📍 Lokasi: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* MAP */}
        <div className="bg-gray-800 p-4 rounded-xl">
          <h2 className="mb-2">Map</h2>
          <div id="map" style={{ height: "400px" }}></div>
        </div>

      </div>
    </div>
  );
}

export default App;