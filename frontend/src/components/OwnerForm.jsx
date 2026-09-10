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

  const [errorMsg, setErrorMsg] = useState('');
  const estimatedIncome = formData.area_sqft ? formData.area_sqft * 15 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 

    // Day 2 Strict Client-Side Validations
    if (formData.phone_number.length !== 10 || isNaN(formData.phone_number)) {
      setErrorMsg('Error: Phone number must be exactly 10 digits.');
      return;
    }
    if (Number(formData.area_sqft) <= 0) {
      setErrorMsg('Error: Roof area must be greater than 0.');
      return;
    }

    try {
      await submitRoofDetails({
        ...formData,
        area_sqft: Number(formData.area_sqft)
      });
      alert('Roof Listing Submitted Successfully! Status: Pending Verification');
      setFormData({...formData, owner_name: '', phone_number: '', area_sqft: ''});
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Submission failed. Backend API not live yet.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h2 className="text-xl font-bold text-sky-700 mb-4">List Your Roof</h2>
      
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Owner Name" 
          required
          className="w-full border p-2 rounded outline-none focus:border-sky-700" 
          value={formData.owner_name}
          onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Phone Number (10 digits)" 
          required
          className="w-full border p-2 rounded outline-none focus:border-sky-700" 
          value={formData.phone_number}
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Area (sq ft)" 
          required
          className="w-full border p-2 rounded outline-none focus:border-sky-700" 
          value={formData.area_sqft}
          onChange={(e) => setFormData({...formData, area_sqft: e.target.value})}
        />
        <select 
          className="w-full border p-2 rounded outline-none focus:border-sky-700 text-slate-700"
          value={formData.roof_type}
          onChange={(e) => setFormData({...formData, roof_type: e.target.value})}
        >
          <option value="concrete">Concrete</option>
          <option value="flat">Flat</option>
          <option value="sloped">Sloped</option>
          <option value="tin">Tin</option>
        </select>
        
        <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-sm font-semibold">
          Estimated Monthly Earnings: ₹{estimatedIncome.toLocaleString()}
        </div>
        
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-bold transition">
          Submit Roof
        </button>
      </form>
    </div>
  );
}