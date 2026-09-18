import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRoofDetails } from '../services/api';

const ROOF_TYPES = [
  { value: 'flat', label: 'Flat' },
  { value: 'sloped', label: 'Sloped' },
  { value: 'tin', label: 'Tin' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'other', label: 'Other' },
];

const initialFormData = {
  roof_type: 'flat',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  area_sqft: '',
};

const OwnerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    // Required fields
    if (
      !formData.roof_type ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      formData.latitude === '' ||
      formData.longitude === ''
    ) {
      setError('Please fill all required fields.');
      return;
    }

    // Latitude validation
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      Number.isNaN(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError('Please enter a valid latitude between -90 and 90.');
      return;
    }

    // Longitude validation
    if (
      Number.isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError('Please enter a valid longitude between -180 and 180.');
      return;
    }

    // Prepare backend payload
    const roofData = {
      roof_type: formData.roof_type,
      address: formData.address.trim(),
      city: formData.city.trim(),
      latitude,
      longitude,
    };

    // area_sqft is optional
    if (formData.area_sqft !== '') {
      const area = Number(formData.area_sqft);

      if (Number.isNaN(area) || area <= 0) {
        setError('Area must be a valid positive number.');
        return;
      }

      roofData.area_sqft = area;
    }

    try {
      setLoading(true);

      await submitRoofDetails(roofData);

      setMessage('Roof listing submitted successfully!');

      setFormData(initialFormData);

      setTimeout(() => {
        navigate('/owner-dashboard');
      }, 1200);
    } catch (err) {
      console.error('Roof submission failed:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Unable to submit roof listing.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Owner Portal
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            List Your Roof
          </h1>

          <p className="mt-2 text-slate-400">
            Add your rooftop details so companies can discover your
            property.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          {/* Roof Type */}
          <div className="mb-6">
            <label
              htmlFor="roof_type"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Roof Type <span className="text-red-400">*</span>
            </label>

            <select
              id="roof_type"
              name="roof_type"
              value={formData.roof_type}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              {ROOF_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="mb-6">
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Address <span className="text-red-400">*</span>
            </label>

            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete rooftop address"
              required
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          {/* City */}
          <div className="mb-6">
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              City <span className="text-red-400">*</span>
            </label>

            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Lucknow"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          {/* Coordinates */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="latitude"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Latitude <span className="text-red-400">*</span>
              </label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 26.8467"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="longitude"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Longitude <span className="text-red-400">*</span>
              </label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 80.9462"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Area */}
          <div className="mb-8">
            <label
              htmlFor="area_sqft"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Area (sq ft)
            </label>

            <input
              id="area_sqft"
              name="area_sqft"
              type="number"
              min="0"
              step="any"
              value={formData.area_sqft}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
            />

            <p className="mt-2 text-sm text-cyan-400">
              AI satellite khud calculate karega
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Roof Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerForm; 