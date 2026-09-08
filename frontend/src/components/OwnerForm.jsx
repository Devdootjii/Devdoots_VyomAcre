import React, { useState } from 'react';
import { submitRoofDetails } from '../services/api';

export default function OwnerForm() {
  const [formData, setFormData] = useState({
    owner_name: '',
    phone_number: '',
    area_sqft: '',
    roof_type: 'concrete',
    latitude: 26.8467,
    longitude: 80.9462,
    photos: []
  });

  const estimatedIncome = formData.area_sqft ? formData.area_sqft * 15 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitRoofDetails({
        ...formData,
        area_sqft: Number(formData.area_sqft)
      });
      alert('Roof Listing Submitted Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h2 className="text-xl font-bold text-sky-700 mb-4">List Your Roof (Aryan's Module)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Owner Name" 
          className="w-full border p-2 rounded outline-none focus:border-sky-700" 
          value={formData.owner_name}
          onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Phone Number" 
          className="w-full border p-2 rounded outline-none focus:border-sky-700" 
          value={formData.phone_number}
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Area (sq ft)" 
          className="w-full border p-2 rounded outline-none focus:border-sky-700" 
          value={formData.area_sqft}
          onChange={(e) => setFormData({...formData, area_sqft: e.target.value})}
        />
        <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-sm font-semibold">
          Estimated Monthly Earnings: ₹{estimatedIncome.toLocaleString()}
        </div>
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-semibold transition">
          Submit Roof for Verification
        </button>
      </form>
    </div>
  );
}