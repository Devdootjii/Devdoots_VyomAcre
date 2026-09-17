import React, { useState } from 'react';
import { submitRoofDetails } from '../services/api';

const ROOF_TYPES = ['flat', 'sloped', 'tin', 'concrete', 'other'];

export default function OwnerForm({ onSubmitSuccess }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
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

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));

    setErrorMsg('');
    setSuccessMsg('');
  };

  const validateProperty = () => {
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
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

    // area_sqft is optional
    if (
      formData.area_sqft !== '' &&
      (!Number.isFinite(Number(formData.area_sqft)) ||
        Number(formData.area_sqft) <= 0)
    ) {
      setErrorMsg('Area must be greater than 0 when provided.');
      return false;
    }

    if (
      formData.property_type === 'roof' &&
      !ROOF_TYPES.includes(formData.roof_type)
    ) {
      setErrorMsg('Please select a valid roof type.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setErrorMsg('');

    if (!validateProperty()) {
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!validateProperty()) {
      return;
    }

    const submittedData = {
      property_type: formData.property_type,
      roof_type:
        formData.property_type === 'roof'
          ? formData.roof_type
          : undefined,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      photos: formData.photos
    };

    // area_sqft is optional, so only send it when provided.
    if (formData.area_sqft !== '') {
      submittedData.area_sqft = Number(formData.area_sqft);
    }

    setIsSubmitting(true);

    try {
      const response = await submitRoofDetails(submittedData);

      const responseData = response?.data?.data || response?.data || {};

      onSubmitSuccess?.({
        ...submittedData,
        ...responseData,
        status:
          responseData?.verification_status ||
          responseData?.status ||
          'Pending'
      });

      setSuccessMsg(
        'Property submitted successfully! Status: Pending Verification.'
      );

      setFormData({
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

      const detail = apiError?.response?.data?.detail;

      setErrorMsg(
        typeof detail === 'string'
          ? detail
          : apiError?.response?.data?.message ||
          'Unable to submit property. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedIncome =
    formData.area_sqft !== ''
      ? Number(formData.area_sqft) * 15
      : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
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

      <div className="mb-8 grid grid-cols-2 gap-2">
        <div
          className={`rounded-lg p-3 text-center text-sm font-bold ${step >= 1
              ? 'bg-sky-500 text-white'
              : 'bg-slate-100 text-slate-400'
            }`}
        >
          1. Property
        </div>

        <div
          className={`rounded-lg p-3 text-center text-sm font-bold ${step >= 2
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-400'
            }`}
        >
          2. Review
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Property Type
              </label>

              <select
                value={formData.property_type}
                onChange={(event) =>
                  updateField('property_type', event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-700 outline-none focus:border-sky-500"
              >
                <option value="roof">Roof</option>
                <option value="plot">Plot</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Area (sq ft) — Optional
              </label>

              <input
                type="number"
                min="0"
                step="any"
                placeholder="Leave blank for automatic satellite calculation"
                value={formData.area_sqft}
                onChange={(event) =>
                  updateField('area_sqft', event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                If you leave this blank, the area can be calculated automatically.
              </p>
            </div>

            {formData.property_type === 'roof' && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Roof Type
                </label>

                <select
                  value={formData.roof_type}
                  onChange={(event) =>
                    updateField('roof_type', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-700 outline-none focus:border-sky-500"
                >
                  {ROOF_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                onChange={(event) =>
                  updateField('latitude', event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
              />
            </div>

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
                onChange={(event) =>
                  updateField('longitude', event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
              />
            </div>

            {formData.property_type === 'roof' &&
              formData.area_sqft !== '' && (
                <div className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
                  Estimated Monthly Earnings: ₹
                  {estimatedIncome.toLocaleString()}
                </div>
              )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-xl bg-sky-500 py-3 font-bold text-white transition hover:bg-sky-600"
            >
              Continue to Review →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Property Review
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-bold">Type:</span>{' '}
                  {formData.property_type}
                </p>

                <p>
                  <span className="font-bold">Area:</span>{' '}
                  {formData.area_sqft
                    ? `${formData.area_sqft} sq ft`
                    : 'Automatic calculation'}
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

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <p className="text-sm font-bold text-sky-700">
                Ready to Submit
              </p>

              <p className="mt-1 text-sm text-sky-600">
                Your owner identity will come from your authenticated account.
              </p>
            </div>

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
                className="w-2/3 rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Property'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}