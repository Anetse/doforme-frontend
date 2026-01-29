import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function LocationMarker({ position, setPosition, setLabel }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // Reverse geocode for label
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => setLabel(data.display_name || 'Selected Location'))
        .catch(() => setLabel('Selected Location'));
    },
  });

  useEffect(() => {
    if (position && typeof position.lat === 'number' && typeof position.lng === 'number') {
      try {
        map.flyTo(position, map.getZoom());
      } catch (e) {
        console.error("Map flyTo error:", e);
      }
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Component to center map
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
        try {
            map.setView(center, zoom);
        } catch (e) {
            console.error("Map setView error:", e);
        }
    } else if (Array.isArray(center) && center.length === 2) {
        try {
            map.setView(center, zoom);
        } catch (e) {
             console.error("Map setView error (array):", e);
        }
    }
  }, [center, zoom, map]);
  return null;
}

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  // Default to Lagos if no initial location
  const defaultCenter = initialLocation 
    ? [initialLocation.lat, initialLocation.lng] 
    : [6.5244, 3.3792];

  const [position, setPosition] = useState(initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null);
  const [label, setLabel] = useState(initialLocation ? initialLocation.label : '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (isNaN(lat) || isNaN(lng)) return;

    const newPos = { lat, lng };
    setPosition(newPos);
    setLabel(result.display_name);
    setResults([]); // Clear results
  };

  const handleConfirm = () => {
    if (position) {
      onLocationSelect({ lat: position.lat, lng: position.lng, label });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, area, or place..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>
        
        {results.length > 0 && (
          <ul className="absolute z-[1000] bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
            {results.map((r) => (
              <li 
                key={r.place_id} 
                onClick={() => selectResult(r)}
                className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0 text-gray-700"
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative bg-gray-100">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
           <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} setLabel={setLabel} />
          {position && <ChangeView center={position} zoom={15} />}
        </MapContainer>
      </div>

      {label && (
        <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-sm border border-blue-100">
          <span className="font-semibold">Selected:</span> {label}
        </div>
      )}

      <button 
        onClick={handleConfirm}
        disabled={!position}
        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
          position ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Confirm Location
      </button>
    </div>
  );
};

export default LocationPicker;