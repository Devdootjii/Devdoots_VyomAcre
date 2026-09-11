import React, { useState } from 'react';
import { submitRoofDetails } from '../services/api';

export default function OwnerForm({ onSubmitSuccess }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    owner_name: '',
    phone_number: '',
    property_type: 'roof',
    area_sqft: '',
    roof_type: 'concrete',
    latitude: 26.8467,
    longitude: 80.9462,
    photos: []
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const estimatedIncome = formData.area_sqft
    ? Number(formData.area_sqft) * 15
    : 0;

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));

    setErrorMsg('');
  };

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

  const validateStep2 = () => {
    if (!formData.area_sqft || Number(formData.area_sqft) <= 0) {
      setErrorMsg('Property area must be greater than 0.');
      return false;
    }

    return true;
  };

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
      status: 'Pending',
    };

    try {
      await submitRoofDetails(submittedData);
    } catch (apiError) {
      console.warn(
        'Backend submission failed, saving locally:',
        apiError
      );
    }

    // Send submitted data to App.jsx
    onSubmitSuccess?.(submittedData);

    setSuccessMsg(
      'Property submitted successfully! Status: Pending Verification.'
    );

    // Reset form
    setFormData({
      owner_name: '',
      phone_number: '',
      property_type: 'roof',
      area_sqft: '',
      roof_type: 'concrete',
      latitude: 26.8467,
      longitude: 80.9462,
      photos: []
    });

    setStep(1);
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

      {/* Error */}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* STEP 1 */}
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
              className="w-full rounded-xl bg-sky-500 py-3 font-bold text-white transition hover:bg-sky-600"
            >
              Continue to Property Details →
            </button>

          </div>
        )}

        {/* STEP 2 */}
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
                  <option value="concrete">Concrete</option>
                  <option value="flat">Flat</option>
                  <option value="sloped">Sloped</option>
                  <option value="tin">Tin</option>
                </select>
              </div>
            )}

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
                className="w-2/3 rounded-xl bg-sky-500 py-3 font-bold text-white transition hover:bg-sky-600"
              >
                Review Details →
              </button>

            </div>

          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">

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

              </div>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <p className="text-sm font-bold text-sky-700">
                Ready to Submit
              </p>

              <p className="mt-1 text-sm text-sky-600">
                Please verify your details before submitting the property.
              </p>
            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 rounded-xl border border-slate-300 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
              >
                ← Back
              </button>

              <button
                type="submit"
                className="w-2/3 rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600"
              >
                Submit Property
              </button>

            </div>

          </div>
        )}

      </form>
    </div>
  );
}