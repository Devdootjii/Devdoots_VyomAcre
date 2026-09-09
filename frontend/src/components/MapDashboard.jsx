import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getVerifiedRoofs } from '../services/api';

export default function MapDashboard() {
  const [roofs, setRoofs] = useState([]);
  const [minArea, setMinArea] = useState(0);

  // Day 2 Requirement: Dummy coordinates for initial map render
  const defaultCenter = [26.8467, 80.9462]; 

  useEffect(() => {
    getVerifiedRoofs()
      .then((res) => setRoofs(res.data?.data || []))
      .catch(() => {
        // Fallback for dummy data testing
        setRoofs([
          { roof_id: 'RF-101', area_sqft: 1200, coordinates: { lat: 26.8467, lng: 80.9462 }, status: 'available' },
          { roof_id: 'RF-102', area_sqft: 2500, coordinates: { lat: 26.8500, lng: 80.9500 }, status: 'available' }
        ]);
      });
  }, []);

  const filteredRoofs = roofs.filter(r => r.area_sqft >= minArea);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-sky-700">Company Marketplace Dashboard</h2>
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

      {/* Split-Screen Layout as per PDF 7 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
        {/* Left Side: Interactive Map Container */}
        <div className="md:col-span-2 rounded-lg overflow-hidden border-2 border-slate-300 relative z-0">
          <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredRoofs.map((roof) => (
              <Marker key={roof.roof_id} position={[roof.coordinates.lat, roof.coordinates.lng]}>
                <Popup>
                  <strong className="text-sky-700">{roof.roof_id}</strong> <br /> 
                  Area: {roof.area_sqft} sq ft.
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right Side: Scrollable List View */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-y-auto">
          <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Available Listings ({filteredRoofs.length})</h3>
          {filteredRoofs.map((roof) => (
            <div key={roof.roof_id} className="bg-white p-3 mb-3 rounded shadow-sm border border-slate-200 transition hover:shadow-md">
              <p className="font-bold text-sky-700">{roof.roof_id}</p>
              <p className="text-sm text-slate-600">Area: {roof.area_sqft} sq ft</p>
              <button className="mt-2 w-full bg-amber-500 text-white text-sm py-1.5 rounded font-semibold hover:bg-amber-600 transition">
                Send Lease Request
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}