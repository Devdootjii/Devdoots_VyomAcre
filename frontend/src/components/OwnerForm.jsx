import React, { useState } from 'react';
import { submitRoofDetails } from '../services/api';
import MapPicker from './MapPicker';

export default function OwnerForm() {
  const [formData, setFormData] = useState({
    owner_name: '',
    phone_number: '',
    area_sqft: '',
    roof_type: 'concrete',
    photos: []
  });
  
  const [position, setPosition] = useState(null); 
  const [error, setError] = useState('');

  const estimatedIncome = formData.area_sqft ? formData.area_sqft * 15 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.phone_number.length < 10) {
        setError("Phone number must be at least 10 digits.");
        return;
    }
    if (formData.area_sqft <= 0) {
        setError("Area must be greater than 0.");
        return;
    }
    if (!position) {
        setError("Please drop a pin on the map to select your roof location.");
        return;
    }

    try {
      await submitRoofDetails({
        ...formData,
        area_sqft: Number(formData.area_sqft),
        latitude: position.lat,
        longitude: position.lng
      });
      alert('Roof Listing Submitted Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-bold text-sky-700 mb-4">List Your Roof (Modular UI)</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Owner Name" 
              className="w-full border p-2 rounded outline-none focus:border-sky-700" 
              value={formData.owner_name}
              onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              className="w-full border p-2 rounded outline-none focus:border-sky-700" 
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              placeholder="Area (sq ft)" 
              className="w-full border p-2 rounded outline-none focus:border-sky-700" 
              value={formData.area_sqft}
              onChange={(e) => setFormData({...formData, area_sqft: e.target.value})}
            />
            <select 
              className="w-full border p-2 rounded outline-none focus:border-sky-700 bg-white"
              value={formData.roof_type}
              onChange={(e) => setFormData({...formData, roof_type: e.target.value})}
            >
                <option value="flat">Flat</option>
                <option value="sloped">Sloped</option>
                <option value="tin">Tin</option>
                <option value="concrete">Concrete</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Drop a pin on your location (Latitude: {position?.lat?.toFixed(4) || '-'}, Longitude: {position?.lng?.toFixed(4) || '-'})
            </label>
            <MapPicker position={position} setPosition={setPosition} />
        </div>

        <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-sm font-semibold mt-4">
          Estimated Monthly Earnings: ₹{estimatedIncome.toLocaleString()}
        </div>
        
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-semibold transition mt-4">
          Submit Roof for Verification
        </button>
      </form>
    </div>
  );
}