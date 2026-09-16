import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitRoofDetails } from '../services/api';

const pageTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

const buttonTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 24,
};

function AmbientGlow({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute rounded-full bg-[#00FF87]/[0.045] blur-[110px] ' +
        className
      }
    />
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400"
    >
      {children}
    </label>
  );
}

function StepPill({ number, label, active, completed }) {
  const stepClass =
    'relative overflow-hidden rounded-xl border px-3 py-3 transition-all duration-300 sm:px-4 ' +
    (active
      ? 'border-[#00FF87]/35 bg-[#00FF87]/[0.055] text-white shadow-[0_0_20px_rgba(0,255,135,0.05)]'
      : completed
        ? 'border-[#00FF87]/15 bg-white/[0.025] text-slate-300'
        : 'border-white/10 bg-white/[0.03] text-slate-500');

  const numberClass =
    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[9px] ' +
    (active
      ? 'bg-[#00FF87] text-[#020706]'
      : completed
        ? 'border border-[#00FF87]/20 bg-[#00FF87]/[0.06] text-[#00FF87]'
        : 'border border-white/10 bg-white/[0.02] text-slate-600');

  return (
    <div className={stepClass}>
      <div className="relative flex items-center gap-2.5">
        <span className={numberClass}>
          {completed ? '✓' : number}
        </span>

        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.13em] sm:text-[11px]">
          {label}
        </span>
      </div>

      {active && (
        <motion.span
          layoutId="owner-step-indicator"
          className="absolute inset-x-0 bottom-0 h-px bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.7)]"
          transition={buttonTransition}
        />
      )}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-sm font-medium text-slate-200">
        {value}
      </span>
    </div>
  );
}

function StepHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00FF87]">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-2xl font-medium tracking-[-0.05em] text-white sm:text-3xl">
        {title}
      </h3>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

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
    photos: [],
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
      [field]: value,
    }));

    setErrorMsg('');
    setSuccessMsg('');
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

  const isStep1Valid = Boolean(
    formData.owner_name.trim() &&
      /^\d{10}$/.test(formData.phone_number)
  );

  const isStep2Valid = Boolean(
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
      longitude: Number(formData.longitude),
    };

    setIsSubmitting(true);

    try {
      await submitRoofDetails(submittedData);

      onSubmitSuccess?.({
        ...submittedData,
        status: 'Pending',
      });

      setSuccessMsg(
        'Property submitted successfully! Status: Pending Verification.'
      );

      setFormData({
        owner_name: '',
        phone_number: '',
        property_type: 'roof',
        area_sqft: '',
        roof_type: 'flat',
        latitude: 26.8467,
        longitude: 80.9462,
        photos: [],
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
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
      <AmbientGlow className="left-1/2 top-[-90px] h-[240px] w-[460px] -translate-x-1/2" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00FF87]">
            Owner Portal
          </p>

          <h2 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl">
            List Your Property
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Submit your roof or plot details for verification.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-2">
          <StepPill
            number="1"
            label="Owner"
            active={step === 1}
            completed={step > 1}
          />

          <StepPill
            number="2"
            label="Property"
            active={step === 2}
            completed={step > 2}
          />

          <StepPill
            number="3"
            label="Review"
            active={step === 3}
            completed={false}
          />
        </div>

        <AnimatePresence initial={false}>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={pageTransition}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.055] p-4 text-sm text-red-300">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-400/20 bg-red-400/[0.05] text-xs">
                    !
                  </div>

                  <p className="leading-6">{errorMsg}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={pageTransition}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-[#00FF87]/20 bg-[#00FF87]/[0.045] p-4 text-sm text-[#00FF87]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.08] text-xs">
                    ✓
                  </div>

                  <p className="leading-6">{successMsg}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={pageTransition}
                className="space-y-5"
              >
                <StepHeader
                  eyebrow="01 / Owner Information"
                  title="Tell us about yourself."
                  description="We need a few basic details to associate the rooftop with its owner."
                />

                <div>
                  <FieldLabel htmlFor="owner_name">Owner Name</FieldLabel>

                  <input
                    id="owner_name"
                    type="text"
                    placeholder="Enter owner name"
                    value={formData.owner_name}
                    onChange={(e) =>
                      updateField('owner_name', e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none placeholder:text-slate-700 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.04)]"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="phone_number">
                    Phone Number
                  </FieldLabel>

                  <input
                    id="phone_number"
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
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none placeholder:text-slate-700 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.04)]"
                  />

                  <p className="mt-2 text-[10px] text-slate-600">
                    Enter exactly 10 digits without spaces or symbols.
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  whileHover={isStep1Valid ? { scale: 1.012 } : {}}
                  whileTap={isStep1Valid ? { scale: 0.985 } : {}}
                  transition={buttonTransition}
                  className={
                    'flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706] ' +
                    (isStep1Valid
                      ? 'bg-[#00FF87] text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] hover:shadow-[0_0_25px_rgba(0,255,135,0.4)]'
                      : 'cursor-not-allowed bg-white/10 text-slate-600')
                  }
                >
                  Continue to Property Details
                  <span className="ml-2 text-base">→</span>
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={pageTransition}
                className="space-y-5"
              >
                <StepHeader
                  eyebrow="02 / Property Details"
                  title="Define the space."
                  description="Add the basic property and location information needed for verification."
                />

                <div>
                  <FieldLabel htmlFor="property_type">
                    Property Type
                  </FieldLabel>

                  <div className="relative">
                    <select
                      id="property_type"
                      value={formData.property_type}
                      onChange={(e) =>
                        updateField('property_type', e.target.value)
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#030A08] px-4 pr-10 text-sm text-white outline-none transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10"
                    >
                      <option value="roof" className="bg-[#030A08]">
                        Roof
                      </option>

                      <option value="plot" className="bg-[#030A08]">
                        Plot
                      </option>
                    </select>

                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="m7 10 5 5 5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="area_sqft">
                    Area (sq ft)
                  </FieldLabel>

                  <input
                    id="area_sqft"
                    type="number"
                    min="1"
                    placeholder="Enter property area"
                    value={formData.area_sqft}
                    onChange={(e) =>
                      updateField('area_sqft', e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none placeholder:text-slate-700 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.04)]"
                  />
                </div>

                <AnimatePresence initial={false}>
                  {formData.property_type === 'roof' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={pageTransition}
                      className="overflow-hidden"
                    >
                      <FieldLabel htmlFor="roof_type">
                        Roof Type
                      </FieldLabel>

                      <div className="relative">
                        <select
                          id="roof_type"
                          value={formData.roof_type}
                          onChange={(e) =>
                            updateField('roof_type', e.target.value)
                          }
                          className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#030A08] px-4 pr-10 text-sm text-white outline-none transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10"
                        >
                          <option
                            value="flat"
                            className="bg-[#030A08]"
                          >
                            Flat
                          </option>

                          <option
                            value="sloped"
                            className="bg-[#030A08]"
                          >
                            Sloped
                          </option>

                          <option
                            value="tin"
                            className="bg-[#030A08]"
                          >
                            Tin
                          </option>

                          <option
                            value="concrete"
                            className="bg-[#030A08]"
                          >
                            Concrete
                          </option>

                          <option
                            value="other"
                            className="bg-[#030A08]"
                          >
                            Other
                          </option>
                        </select>

                        <svg
                          aria-hidden="true"
                          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="m7 10 5 5 5-5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="latitude">
                      Latitude
                    </FieldLabel>

                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={formData.latitude}
                      onChange={(e) =>
                        updateField('latitude', e.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="longitude">
                      Longitude
                    </FieldLabel>

                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={formData.longitude}
                      onChange={(e) =>
                        updateField('longitude', e.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10"
                    />
                  </div>
                </div>

                {formData.property_type === 'roof' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-[#00FF87]/15 bg-[#00FF87]/[0.035] p-5"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#00FF87]/[0.06] blur-3xl" />

                    <div className="relative flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          Estimated Monthly Earnings
                        </p>

                        <p className="mt-2 font-mono text-2xl tracking-[-0.04em] text-[#00FF87]">
                          ₹{estimatedIncome.toLocaleString()}
                        </p>
                      </div>

                      <span className="hidden text-[9px] uppercase tracking-[0.14em] text-slate-600 sm:block">
                        Indicative
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-1">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    transition={buttonTransition}
                    className="flex h-12 w-1/3 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-sm font-medium text-slate-300 outline-none transition-all duration-200 hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/25"
                  >
                    ← Back
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep2Valid}
                    whileHover={isStep2Valid ? { scale: 1.01 } : {}}
                    whileTap={isStep2Valid ? { scale: 0.985 } : {}}
                    transition={buttonTransition}
                    className={
                      'flex h-12 w-2/3 items-center justify-center rounded-full text-sm font-semibold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706] ' +
                      (isStep2Valid
                        ? 'bg-[#00FF87] text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] hover:shadow-[0_0_25px_rgba(0,255,135,0.4)]'
                        : 'cursor-not-allowed bg-white/10 text-slate-600')
                    }
                  >
                    Review Details
                    <span className="ml-2">→</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={pageTransition}
                className="space-y-4"
              >
                <StepHeader
                  eyebrow="03 / Final Review"
                  title="Check your details."
                  description="Make sure everything looks correct before sending your property for verification."
                />

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Owner
                    </p>

                    <span className="font-mono text-[9px] text-slate-700">
                      01
                    </span>
                  </div>

                  <ReviewItem
                    label="Name"
                    value={formData.owner_name}
                  />

                  <ReviewItem
                    label="Phone"
                    value={formData.phone_number}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Property
                    </p>

                    <span className="font-mono text-[9px] text-slate-700">
                      02
                    </span>
                  </div>

                  <ReviewItem
                    label="Type"
                    value={formData.property_type}
                  />

                  <ReviewItem
                    label="Area"
                    value={formData.area_sqft + ' sq ft'}
                  />

                  {formData.property_type === 'roof' && (
                    <ReviewItem
                      label="Roof Type"
                      value={formData.roof_type}
                    />
                  )}

                  <ReviewItem
                    label="Latitude"
                    value={formData.latitude}
                  />

                  <ReviewItem
                    label="Longitude"
                    value={formData.longitude}
                  />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-[#00FF87]/15 bg-[#00FF87]/[0.035] p-5">
                  <div className="absolute right-[-15px] top-[-15px] h-24 w-24 rounded-full bg-[#00FF87]/[0.06] blur-3xl" />

                  <div className="relative flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.06] text-[#00FF87]">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Ready to Submit
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Please verify your details before submitting the
                        property.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { y: -1 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.985 } : {}}
                    transition={buttonTransition}
                    className="flex h-12 w-1/3 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-sm font-medium text-slate-300 outline-none transition-all duration-200 hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Back
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.985 } : {}}
                    transition={buttonTransition}
                    className={
                      'flex h-12 w-2/3 items-center justify-center rounded-full text-sm font-semibold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706] ' +
                      (isSubmitting
                        ? 'cursor-not-allowed bg-white/10 text-slate-600'
                        : 'bg-[#00FF87] text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] hover:shadow-[0_0_25px_rgba(0,255,135,0.4)]')
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#020706]/20 border-t-[#020706]" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Property
                        <span className="ml-2 text-base">✦</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}