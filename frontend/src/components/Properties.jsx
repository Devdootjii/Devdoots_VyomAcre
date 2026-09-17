import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const properties = [
  {
    id: 1,
    city: 'Noida',
    location: 'Sector 62, Noida',
    type: 'Flat roof',
    size: '2,400 sq ft',
    price: '₹15/sq ft/mo',
    status: 'Verified',
    coordinates: { top: '29%', left: '58%' },
    accent: 'high',
  },
  {
    id: 2,
    city: 'Lucknow',
    location: 'Gomti Nagar, Lucknow',
    type: 'Commercial roof',
    size: '3,800 sq ft',
    price: '₹12/sq ft/mo',
    status: 'Verified',
    coordinates: { top: '43%', left: '35%' },
    accent: 'medium',
  },
  {
    id: 3,
    city: 'Kanpur',
    location: 'Civil Lines, Kanpur',
    type: 'Flat roof',
    size: '1,950 sq ft',
    price: '₹11/sq ft/mo',
    status: 'Pending',
    coordinates: { top: '55%', left: '48%' },
    accent: 'low',
  },
  {
    id: 4,
    city: 'Varanasi',
    location: 'Sigra, Varanasi',
    type: 'Industrial roof',
    size: '5,200 sq ft',
    price: '₹18/sq ft/mo',
    status: 'Verified',
    coordinates: { top: '61%', left: '69%' },
    accent: 'high',
  },
  {
    id: 5,
    city: 'Delhi',
    location: 'Dwarka, New Delhi',
    type: 'Commercial roof',
    size: '4,100 sq ft',
    price: '₹20/sq ft/mo',
    status: 'Verified',
    coordinates: { top: '24%', left: '26%' },
    accent: 'high',
  },
  {
    id: 6,
    city: 'Prayagraj',
    location: 'Civil Lines, Prayagraj',
    type: 'Flat roof',
    size: '2,750 sq ft',
    price: '₹13/sq ft/mo',
    status: 'Verified',
    coordinates: { top: '49%', left: '61%' },
    accent: 'medium',
  },
];

const cities = [
  'All Cities',
  'Delhi',
  'Noida',
  'Lucknow',
  'Kanpur',
  'Varanasi',
  'Prayagraj',
];

const types = [
  'All Types',
  'Flat roof',
  'Commercial roof',
  'Industrial roof',
];

const mapLines = [
  { top: '18%', left: '-8%', rotate: 18, width: '75%' },
  { top: '37%', left: '-12%', rotate: -8, width: '82%' },
  { top: '59%', left: '-6%', rotate: 22, width: '88%' },
  { top: '80%', left: '-10%', rotate: -14, width: '76%' },
  { top: '4%', left: '31%', rotate: 90, width: '100%' },
  { top: '0%', left: '60%', rotate: 90, width: '94%' },
];

function MapPin({ property, active, onClick }) {
  const pinClass =
    'relative flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#020706] bg-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.8)] transition-transform duration-200 ' +
    (active ? 'scale-125' : '');

  return (
    <motion.button
      type="button"
      aria-label={'View ' + property.location}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: active ? 1.12 : 1,
      }}
      transition={{
        duration: 0.4,
        delay: property.id * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{
        top: property.coordinates.top,
        left: property.coordinates.left,
      }}
    >
      <span className="relative flex h-8 w-8 items-center justify-center">
        <motion.span
          animate={{
            scale: active ? [1, 1.8, 1] : [1, 1.5, 1],
            opacity: active ? [0.35, 0, 0.35] : [0.2, 0, 0.2],
          }}
          transition={{
            duration: active ? 1.6 : 2.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-full bg-[#00FF87]"
        />

        <span className={pinClass} />
      </span>
    </motion.button>
  );
}

function FilterSelect({ value, options, onChange, label }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 appearance-none rounded-full border border-white/10 bg-white/[0.035] pl-4 pr-9 text-xs font-medium text-slate-300 outline-none backdrop-blur-xl transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05] focus:border-[#00FF87]/30 focus:ring-1 focus:ring-[#00FF87]/20"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#07110D] text-white"
          >
            {option}
          </option>
        ))}
      </select>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
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
    </label>
  );
}

function StatusBadge({ status }) {
  const isVerified = status === 'Verified';

  const badgeClass =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] ' +
    (isVerified
      ? 'border-[#00FF87]/20 bg-[#00FF87]/[0.06] text-[#00FF87]'
      : 'border-amber-400/20 bg-amber-400/[0.05] text-amber-300');

  const dotClass =
    'h-1.5 w-1.5 rounded-full ' +
    (isVerified
      ? 'bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.7)]'
      : 'bg-amber-300');

  return (
    <span className={badgeClass}>
      <span className={dotClass} />
      {status}
    </span>
  );
}

function PropertyCard({ property, isActive, onSelect }) {
  const cardClass =
    'group relative w-full overflow-hidden rounded-2xl border p-4 text-left outline-none backdrop-blur-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00FF87]/30 ' +
    (isActive
      ? 'border-[#00FF87]/25 bg-[#00FF87]/[0.045] shadow-[0_0_25px_rgba(0,255,135,0.07)]'
      : 'border-white/10 bg-white/[0.025] hover:border-[#00FF87]/20 hover:bg-white/[0.04] hover:shadow-[0_0_25px_rgba(0,255,135,0.055)]');

  const accentClass =
    'absolute left-0 top-0 h-full w-px transition-opacity duration-300 ' +
    (isActive
      ? 'bg-[#00FF87] opacity-100'
      : 'bg-[#00FF87] opacity-0 group-hover:opacity-60');

  const arrowClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ' +
    (isActive
      ? 'border-[#00FF87]/25 bg-[#00FF87]/10 text-[#00FF87]'
      : 'border-white/10 bg-white/[0.025] text-slate-500 group-hover:border-[#00FF87]/20 group-hover:text-[#00FF87]');

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(property)}
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 28,
      }}
      className={cardClass}
    >
      <div aria-hidden="true" className={accentClass} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium tracking-[-0.015em] text-white">
              {property.location}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            {property.type}
            <span className="px-1 text-slate-700">•</span>
            {property.size}
          </p>
        </div>

        <StatusBadge status={property.status} />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="block text-[9px] uppercase tracking-[0.16em] text-slate-600">
            Monthly rate
          </span>

          <span className="mt-1 block text-sm font-semibold tracking-[-0.01em] text-[#00FF87]">
            {property.price}
          </span>
        </div>

        <span className={arrowClass}>
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </motion.button>
  );
}

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState(properties[0]);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const cityMatch =
        selectedCity === 'All Cities' || property.city === selectedCity;

      const typeMatch =
        selectedType === 'All Types' || property.type === selectedType;

      return cityMatch && typeMatch;
    });
  }, [selectedCity, selectedType]);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  const handleClearFilters = () => {
    setSelectedCity('All Cities');
    setSelectedType('All Types');
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#020706] font-sans text-white">
      {/* =========================================================
          MAP AREA
      ========================================================= */}
      <section className="relative hidden h-screen flex-1 overflow-hidden lg:block">
        {/* Map Base */}
        <div className="absolute inset-0 bg-[#03100C]" />

        {/* Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Secondary Fine Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,255,135,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.15) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Abstract Map Roads */}
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden opacity-40"
        >
          {mapLines.map((line, index) => (
            <div
              key={index}
              className="absolute h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"
              style={{
                top: line.top,
                left: line.left,
                width: line.width,
                transform: 'rotate(' + line.rotate + 'deg)',
                transformOrigin: 'left center',
              }}
            />
          ))}

          <div className="absolute left-[18%] top-[12%] h-[620px] w-px rotate-[25deg] bg-slate-500/15" />
          <div className="absolute left-[43%] top-[-8%] h-[680px] w-px rotate-[-18deg] bg-slate-500/15" />
          <div className="absolute right-[24%] top-[-7%] h-[710px] w-px rotate-[14deg] bg-slate-500/15" />

          <div className="absolute left-[5%] top-[44%] h-36 w-36 rounded-full border border-slate-500/10" />
          <div className="absolute left-[42%] top-[26%] h-56 w-56 rounded-full border border-slate-500/10" />
          <div className="absolute right-[7%] bottom-[12%] h-44 w-44 rounded-full border border-slate-500/10" />
        </div>

        {/* Atmospheric Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FF87]/[0.035] blur-[150px]"
        />

        <motion.div
          aria-hidden="true"
          animate={{
            scale: [0.85, 1.15, 0.85],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute left-1/2 top-[48%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00FF87]/20"
        />

        <motion.div
          aria-hidden="true"
          animate={{
            scale: [1, 1.45, 1],
            opacity: [0.12, 0, 0.12],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="pointer-events-none absolute left-1/2 top-[48%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00FF87]/30"
        />

        {/* Map Header Overlay */}
        <div className="absolute left-6 top-6 z-30 rounded-2xl border border-white/10 bg-[#020706]/65 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#00FF87]/20 bg-[#00FF87]/[0.05]">
              <svg
                className="h-4 w-4 text-[#00FF87]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                <path d="M9 3v15M15 6v15" />
              </svg>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Discovery Map
              </p>

              <p className="mt-0.5 text-xs font-medium text-slate-200">
                Live Property Index
              </p>
            </div>
          </div>
        </div>

        {/* Verified Spaces Overlay */}
        <div className="absolute bottom-6 left-6 z-30 rounded-2xl border border-white/10 bg-[#020706]/70 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.04]">
              <motion.span
                animate={{
                  scale: [1, 1.45, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-1 rounded-full border border-[#00FF87]/30"
              />

              <span className="h-2 w-2 rounded-full bg-[#00FF87] shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                6 verified spaces
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                AI-verified rooftop opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="absolute bottom-6 right-6 z-30 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
          LAT 25.3176° <span className="mx-2 text-slate-700">/</span> LONG
          82.9739°
        </div>

        {/* Map Pins */}
        {properties.map((property) => (
          <MapPin
            key={property.id}
            property={property}
            active={selectedProperty?.id === property.id}
            onClick={() => handlePropertySelect(property)}
          />
        ))}
      </section>

      {/* =========================================================
          LIST AREA
      ========================================================= */}
      <aside className="relative flex h-screen w-full flex-col border-l border-white/10 bg-[#020706] lg:w-[40%] lg:min-w-[420px] xl:w-[38%]">
        {/* Ambient glow inside sidebar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-30%] top-[15%] h-72 w-72 rounded-full bg-[#00FF87]/[0.025] blur-[120px]"
        />

        {/* Header */}
        <div className="relative z-10 shrink-0 border-b border-white/10 px-5 pb-4 pt-24 sm:px-6 lg:pt-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.8)]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  PROPERTY INDEX
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-medium tracking-[-0.05em] text-white">
                Available Spaces
              </h1>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Discover verified rooftops ready for their next opportunity.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 sm:block">
              <span className="font-mono text-[10px] text-[#00FF87]">
                {filteredProperties.length.toString().padStart(2, '0')}
              </span>

              <span className="ml-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                matches
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex items-center gap-2">
            <FilterSelect
              label="Filter by city"
              value={selectedCity}
              options={cities}
              onChange={setSelectedCity}
            />

            <FilterSelect
              label="Filter by property type"
              value={selectedType}
              options={types}
              onChange={setSelectedType}
            />

            <button
              type="button"
              onClick={() => setIsFiltersOpen((previous) => !previous)}
              className={
                'ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-slate-400 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#00FF87]/30 ' +
                (isFiltersOpen
                  ? 'border-[#00FF87]/20 bg-[#00FF87]/[0.05] text-[#00FF87]'
                  : 'border-white/10 bg-white/[0.025] hover:border-white/15 hover:text-white')
              }
              aria-label="Toggle filter information"
              aria-expanded={isFiltersOpen}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M4 6h16M7 12h10M10 18h4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
                  <span className="text-[10px] text-slate-500">
                    Showing filtered property opportunities
                  </span>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#00FF87] transition-opacity hover:opacity-70"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Property List */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 sm:px-6">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <PropertyCard
                    property={property}
                    isActive={selectedProperty?.id === property.id}
                    onSelect={handlePropertySelect}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProperties.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-10 text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <svg
                    className="h-4 w-4 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <circle cx="11" cy="11" r="6" />
                    <path d="m16 16 4 4" strokeLinecap="round" />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-300">
                  No matching spaces
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Try adjusting your filters.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Selected Property Footer */}
        <AnimatePresence mode="wait">
          {selectedProperty && (
            <motion.div
              key={selectedProperty.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-20 shrink-0 border-t border-white/10 bg-[#020706]/95 px-5 py-4 backdrop-blur-xl sm:px-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                    Selected Space
                  </span>

                  <p className="mt-1 truncate text-xs font-medium text-slate-200">
                    {selectedProperty.location}
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-full bg-[#00FF87] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#020706] shadow-[0_0_16px_rgba(0,255,135,0.2)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(0,255,135,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706]"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}