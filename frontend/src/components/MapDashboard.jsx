import React, { useState, useEffect } from 'react';
import { getVerifiedRoofs } from '../services/api';

export default function MapDashboard() {
  const [roofs, setRoofs] = useState([]);
  const [minArea, setMinArea] = useState(0);

  useEffect(() => {
    getVerifiedRoofs()
      .then((res) => setRoofs(res.data?.data || []))
      .catch(() => console.log('Backend sync pending, ready for API integration'));
  }, []);

  const filteredRoofs = roofs.filter(r => r.area_sqft >= minArea);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-sky-700">Company Map Dashboard (Ritesh's Module)</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-600">Min Area:</label>
          <input 
            type="number" 
            className="border p-1 w-20 rounded text-sm outline-none"
            value={minArea}
            onChange={(e) => setMinArea(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="w-full h-72 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
        <div className="text-center text-slate-500">
          <p className="font-semibold">Interactive Map View</p>
          <p className="text-sm">Verified Listings ready: {filteredRoofs.length}</p>
        </div>
      </div>
    </div>
  );
}