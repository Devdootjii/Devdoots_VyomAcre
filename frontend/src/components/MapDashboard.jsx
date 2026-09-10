import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllRoofs } from '../services/api';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapDashboard() {
  const [roofs, setRoofs] = useState([]);
  const [minArea, setMinArea] = useState(0);
  const [apiStatus, setApiStatus] = useState('Connecting to Backend...');

  const defaultCenter = [26.8467, 80.9462]; // Lucknow coordinates

  useEffect(() => {
    getAllRoofs()
      .then((res) => {
        const fetchedData = res?.data?.data || [];
        setRoofs(fetchedData);
        setApiStatus(`Live Data Connected (${fetchedData.length} listings)`);
      })
      .catch((err) => {
        console.warn('Backend offline, using fallback dummy data:', err);
        setApiStatus('Showing Fallback Data (Backend Pending)');
        setRoofs([
          { id: '101', area_sqft: 1200, latitude: 26.8467, longitude: 80.9462, status: 'pending', owner_name: 'Suresh Kumar' },
          { id: '102', area_sqft: 2500, latitude: 26.8500, longitude: 80.9500, status: 'approved', owner_name: 'Amit Verma' },
          { id: '103', area_sqft: 1800, latitude: 26.8550, longitude: 80.9400, status: 'approved', owner_name: 'Pooja Singh' }
        ]);
      });
  }, []);

  const filteredRoofs = (roofs || []).filter((r) => Number(r.area_sqft || 0) >= minArea);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-sky-700">Company Marketplace Dashboard</h2>
          <p className={`text-xs font-semibold mt-1 ${apiStatus.includes('Live') ? 'text-emerald-600' : 'text-amber-500'}`}>
            Status: {apiStatus}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-600">Min Area Filter:</label>
          <input 
            type="number" 
            className="border p-1 w-20 rounded text-sm outline-none focus:border-sky-700"
            value={minArea}
            onChange={(e) => setMinArea(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[480px]">
        {/* Left Side: Map */}
        <div className="md:col-span-2 rounded-lg overflow-hidden border border-slate-300 relative z-0 h-[480px]">
          <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredRoofs.map((roof) => (
              roof.latitude && roof.longitude ? (
                <Marker key={roof.id} position={[Number(roof.latitude), Number(roof.longitude)]}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sky-700">ID: {String(roof.id).slice(0, 8)}</p>
                      <p>Area: {roof.area_sqft} sq ft</p>
                      <p>Status: <span className="font-semibold uppercase">{roof.status}</span></p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>
        </div>

        {/* Right Side: Listings */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-y-auto h-[480px]">
          <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">
            Available Listings ({filteredRoofs.length})
          </h3>
          {filteredRoofs.map((roof) => (
            <div key={roof.id} className="bg-white p-3 mb-3 rounded shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sky-700 text-sm">{String(roof.id).slice(0, 8)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  roof.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {roof.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Owner: {roof.owner_name || 'N/A'}</p>
              <p className="text-sm font-medium text-slate-700 mt-1">Area: {roof.area_sqft} sq ft</p>
              <button className="mt-2 w-full bg-amber-500 text-white text-xs py-1.5 rounded font-semibold hover:bg-amber-600">
                Send Lease Request
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}