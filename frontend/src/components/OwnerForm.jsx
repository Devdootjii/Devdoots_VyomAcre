import React, { useState } from 'react';
import { submitRoofDetails } from '../services/api';

export default function OwnerForm({ onSubmitSuccess }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    owner_name: '',
    phone_number: '',
    property_type: 'roof',
    area_sqft: '',
    roof_type: 'flat',
    latitude: 26.8467,
    longitude: 80.9462,
    photos: []
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedIncome = formData.area_sqft
    ? Number(formData.area_sqft) * 15
    : 0;

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));

    setErrorMsg('');
    setSuccessMsg('');
  };

  // STEP 1 VALIDATION
  const validateStep1 = () => {
    if (!formData.owner_name.trim()) {
      setErrorMsg('Owner name is required.');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone_number)) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return false;
    }

    return true;
  };

  // STEP 2 VALIDATION
  const validateStep2 = () => {
    if (!formData.area_sqft || Number(formData.area_sqft) <= 0) {
      setErrorMsg('Property area must be greater than 0.');
      return false;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setErrorMsg('Latitude must be between -90 and 90.');
      return false;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setErrorMsg('Longitude must be between -180 and 180.');
      return false;
    }

    // Backend accepts these exact lowercase roof_type values
    if (
      formData.property_type === 'roof' &&
      !['flat', 'sloped', 'tin', 'concrete', 'other'].includes(
        formData.roof_type
      )
    ) {
      setErrorMsg('Please select a valid roof type.');
      return false;
    }

    return true;
  };

  const isStep1Valid =
    formData.owner_name.trim() &&
    /^\d{10}$/.test(formData.phone_number);

  const isStep2Valid =
    formData.area_sqft &&
    Number(formData.area_sqft) > 0 &&
    Number.isFinite(Number(formData.latitude)) &&
    Number(formData.latitude) >= -90 &&
    Number(formData.latitude) <= 90 &&
    Number.isFinite(Number(formData.longitude)) &&
    Number(formData.longitude) >= -180 &&
    Number(formData.longitude) <= 180 &&
    (
      formData.property_type !== 'roof' ||
      ['flat', 'sloped', 'tin', 'concrete', 'other'].includes(
        formData.roof_type
      )
    );

  const handleNext = () => {
    setErrorMsg('');

    if (step === 1 && !validateStep1()) {
      return;
    }

    if (step === 2 && !validateStep2()) {
      return;
    }

    setStep((previous) => previous + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setStep((previous) => previous - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    const submittedData = {
      ...formData,
      area_sqft: Number(formData.area_sqft),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude)
    };

    setIsSubmitting(true);

    try {
      await submitRoofDetails(submittedData);

      // Update App.jsx only after successful backend response
      onSubmitSuccess?.({
        ...submittedData,
        status: 'Pending'
      });

      setSuccessMsg(
        'Property submitted successfully! Status: Pending Verification.'
      );

      // Reset form
      setFormData({
        owner_name: '',
        phone_number: '',
        property_type: 'roof',
        area_sqft: '',
        roof_type: 'flat',
        latitude: 26.8467,
        longitude: 80.9462,
        photos: []
      });

      setStep(1);
    } catch (apiError) {
      console.error('Roof submission failed:', apiError);

      setErrorMsg(
        apiError?.response?.data?.detail ||
        apiError?.response?.data?.message ||
        'Unable to submit property. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-sky-600">
          Owner Portal
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900">
          List Your Property
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Submit your roof or plot details for verification.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 grid grid-cols-3 gap-2">

        <div
          className={`rounded-lg p-3 text-center text-sm font-bold ${step >= 1
              ? 'bg-sky-500 text-white'
              : 'bg-slate-100 text-slate-400'
            }`}
        >
          1. Owner
        </div>

        <div
          className={`rounded-lg p-3 text-center text-sm font-bold ${step >= 2
              ? 'bg-sky-500 text-white'
              : 'bg-slate-100 text-slate-400'
            }`}
        >
          2. Property
        </div>

        <div
          className={`rounded-lg p-3 text-center text-sm font-bold ${step >= 3
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-400'
            }`}
        >
          3. Review
        </div>

      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Owner Name
              </label>

              <input
                type="text"
                placeholder="Enter owner name"
                value={formData.owner_name}
                onChange={(e) =>
                  updateField('owner_name', e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Phone Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                placeholder="10 digit phone number"
                maxLength="10"
                value={formData.phone_number}
                onChange={(e) =>
                  updateField(
                    'phone_number',
                    e.target.value.replace(/\D/g, '')
                  )
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!isStep1Valid}
              className={`w-full rounded-xl py-3 font-bold text-white transition ${isStep1Valid
                  ? 'bg-sky-500 hover:bg-sky-600'
                  : 'cursor-not-allowed bg-slate-300'
                }`}
            >
              Continue to Property Details →
            </button>

          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Property Type
              </label>

              <select
                value={formData.property_type}
                onChange={(e) =>
                  updateField('property_type', e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-700 outline-none focus:border-sky-500"
              >
                <option value="roof">Roof</option>
                <option value="plot">Plot</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Area (sq ft)
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter property area"
                value={formData.area_sqft}
                onChange={(e) =>
                  updateField('area_sqft', e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
              />
            </div>

            {/* Roof Type */}
            {formData.property_type === 'roof' && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Roof Type
                </label>

                <select
                  value={formData.roof_type}
                  onChange={(e) =>
                    updateField('roof_type', e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-700 outline-none focus:border-sky-500"
                >
                  <option value="flat">Flat</option>
                  <option value="sloped">Sloped</option>
                  <option value="tin">Tin</option>
                  <option value="concrete">Concrete</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Latitude */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={formData.latitude}
                onChange={(e) =>
                  updateField('latitude', e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                value={formData.longitude}
                onChange={(e) =>
                  updateField('longitude', e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
              />
            </div>

            {/* Estimated Income */}
            {formData.property_type === 'roof' && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
                Estimated Monthly Earnings: ₹
                {estimatedIncome.toLocaleString()}
              </div>
            )}

            <div className="flex gap-3">

              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 rounded-xl border border-slate-300 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isStep2Valid}
                className={`w-2/3 rounded-xl py-3 font-bold text-white transition ${isStep2Valid
                    ? 'bg-sky-500 hover:bg-sky-600'
                    : 'cursor-not-allowed bg-slate-300'
                  }`}
              >
                Review Details →
              </button>

            </div>

          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="space-y-6">

            {/* Owner Review */}
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Owner
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {formData.owner_name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {formData.phone_number}
              </p>
            </div>

            {/* Property Review */}
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Property
              </p>

              <div className="mt-3 space-y-2 text-sm">

                <p>
                  <span className="font-bold">Type:</span>{' '}
                  {formData.property_type}
                </p>

                <p>
                  <span className="font-bold">Area:</span>{' '}
                  {formData.area_sqft} sq ft
                </p>

                {formData.property_type === 'roof' && (
                  <p>
                    <span className="font-bold">Roof Type:</span>{' '}
                    {formData.roof_type}
                  </p>
                )}

                <p>
                  <span className="font-bold">Latitude:</span>{' '}
                  {formData.latitude}
                </p>

                <p>
                  <span className="font-bold">Longitude:</span>{' '}
                  {formData.longitude}
                </p>

              </div>
            </div>

            {/* Ready Message */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <p className="text-sm font-bold text-sky-700">
                Ready to Submit
              </p>

              <p className="mt-1 text-sm text-sky-600">
                Please verify your details before submitting the property.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">

              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="w-1/3 rounded-xl border border-slate-300 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-2/3 rounded-xl py-3 font-bold text-white transition ${isSubmitting
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
              >
                {isSubmitting
                  ? 'Submitting...'
                  : 'Submit Property'}
              </button>

            </div>

          </div>
        )}

      </form>
    </div>
  );
}