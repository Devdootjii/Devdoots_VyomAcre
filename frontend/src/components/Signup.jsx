import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function AmbientGlow({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute rounded-full bg-[#00FF87]/[0.055] blur-[130px] ' +
        className
      }
    />
  );
}

function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  hint,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500"
        >
          {label}
        </label>

        {hint && (
          <span className="text-[9px] font-medium text-slate-700">
            {hint}
          </span>
        )}
      </div>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={id === 'password' ? 'new-password' : id}
        required
        className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none placeholder:text-slate-700 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.045)]"
      />
    </div>
  );
}

function IntentIcon({ type }) {
  if (type === 'list') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          d="M4 20V8.5L12 4l8 4.5V20H4Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 20v-5h6v5M8 9h.01M12 9h.01M16 9h.01"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
      <path d="M11 8.5v5M8.5 11h5" strokeLinecap="round" />
    </svg>
  );
}

function IntentCard({
  value,
  title,
  description,
  selected,
  onChange,
  icon,
}) {
  const cardClass =
    'relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ' +
    (selected
      ? 'border-[#00FF87]/70 bg-[#00FF87]/[0.055] shadow-[0_0_25px_rgba(0,255,135,0.08)]'
      : 'border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.035]');

  const iconClass =
    'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-300 ' +
    (selected
      ? 'border-[#00FF87]/25 bg-[#00FF87]/[0.08] text-[#00FF87]'
      : 'border-white/10 bg-white/[0.025] text-slate-500');

  const radioClass =
    'flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300 ' +
    (selected
      ? 'border-[#00FF87] bg-[#00FF87]'
      : 'border-white/20 bg-transparent');

  const titleClass =
    'mt-5 text-sm font-medium tracking-[-0.015em] transition-colors duration-300 ' +
    (selected ? 'text-white' : 'text-slate-300');

  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name="intent"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 24,
        }}
        className={cardClass}
      >
        {selected && (
          <motion.div
            layoutId="intent-glow"
            className="pointer-events-none absolute inset-0 rounded-2xl border border-[#00FF87]/20"
          />
        )}

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className={iconClass}>{icon}</div>

            <span className={radioClass}>
              {selected && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#020706]" />
              )}
            </span>
          </div>

          <h3 className={titleClass}>{title}</h3>

          <p className="mt-1 text-[10px] leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </motion.div>
    </label>
  );
}

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [intent, setIntent] = useState('list');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Connect registration API / authentication service here.
    console.log('Signup attempt:', {
      ...formData,
      intent,
    });
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020706] px-5 py-20 font-sans text-white selection:bg-[#00FF87]/20 selection:text-white sm:px-6">
      {/* Ambient Background */}
      <AmbientGlow className="left-1/2 top-[-8%] h-[520px] w-[760px] -translate-x-1/2" />
      <AmbientGlow className="bottom-[-10%] left-[-10%] h-[320px] w-[320px]" />
      <AmbientGlow className="right-[-10%] top-[35%] h-[280px] w-[280px]" />

      {/* Subtle Background Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Card */}
      <motion.section
        initial={{
          opacity: 0,
          y: 28,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-8">
          {/* Top Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-36 w-72 -translate-x-1/2 rounded-full bg-[#00FF87]/[0.035] blur-[75px]"
          />

          <div className="relative">
            {/* Logo */}
            <div className="flex justify-center">
              <Link
                to="/"
                aria-label="VyomAcre home"
                className="group rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/40"
              >
                <motion.div
                  whileHover={{ y: -1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 24,
                  }}
                  className="text-2xl font-semibold tracking-[-0.045em]"
                >
                  <span className="text-white">Vyom</span>
                  <span className="text-[#00FF87]">Acre</span>
                </motion.div>
              </Link>
            </div>

            {/* Header */}
            <div className="mt-7 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-[#00FF87]/25" />

                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-600">
                  CREATE PROFILE
                </span>

                <span className="h-px w-8 bg-[#00FF87]/25" />
              </div>

              <h1 className="text-3xl font-medium tracking-[-0.05em] text-white sm:text-[2.15rem]">
                Create Account
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                List your space or find spaces to lease
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="space-y-5">
                <Field
                  id="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />

                <Field
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                />

                <Field
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />

                <Field
                  id="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  hint="Min 6 characters"
                />
              </div>

              {/* Intent */}
              <div className="mt-7">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    I WANT TO...
                  </span>

                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <IntentCard
                    value="list"
                    title="List My Roof"
                    description="Monetize unused rooftop space."
                    selected={intent === 'list'}
                    onChange={setIntent}
                    icon={<IntentIcon type="list" />}
                  />

                  <IntentCard
                    value="find"
                    title="Find Spaces"
                    description="Discover rooftops for your business."
                    selected={intent === 'find'}
                    onChange={setIntent}
                    icon={<IntentIcon type="find" />}
                  />
                </div>
              </div>

              {/* Primary CTA */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 24,
                }}
                className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-[#00FF87] text-sm font-semibold text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] outline-none transition-all duration-300 hover:shadow-[0_0_27px_rgba(0,255,135,0.42)] focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706]"
              >
                Create Account
                <span className="ml-2 text-base leading-none">✦</span>
              </motion.button>
            </form>

            {/* Security Indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87]/70 shadow-[0_0_7px_rgba(0,255,135,0.65)]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                Secure account creation
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-slate-400 transition-colors duration-200 hover:text-[#00FF87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
          >
            Login
          </Link>
        </p>
      </motion.section>
    </main>
  );
}