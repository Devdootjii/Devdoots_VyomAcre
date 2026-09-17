import React from 'react';
import { motion } from 'framer-motion';

const values = [
  {
    number: '01',
    eyebrow: 'OUR MISSION',
    title: 'Turn empty rooftops into opportunity.',
    description:
      "Our mission is to turn India's 2.4 billion sq ft of empty urban rooftops into a revenue-generating asset class.",
    icon: 'mission',
  },
  {
    number: '02',
    eyebrow: 'AI-POWERED',
    title: 'Intelligence behind every space.',
    description:
      'Google Earth Engine satellite verification and Gemini AI combine to make property discovery faster, smarter and easier to understand.',
    icon: 'ai',
  },
  {
    number: '03',
    eyebrow: 'B2B MARKETPLACE',
    title: 'Built for trusted transactions.',
    description:
      'Verified owners, authenticated businesses, transparent pricing and digital agreements create a more dependable B2B rooftop marketplace.',
    icon: 'market',
  },
];

const techStack = [
  'React 18',
  'FastAPI',
  'Google Earth Engine',
  'Gemini AI',
  'PostgreSQL',
  'Leaflet Maps',
];

const team = [
  {
    name: 'Divyansh',
    role: 'TPM + Backend',
    initials: 'D',
    code: 'DEV / 01',
  },
  {
    name: 'Ritesh',
    role: 'Backend',
    initials: 'R',
    code: 'DEV / 02',
  },
  {
    name: 'Balram',
    role: 'UI/UX',
    initials: 'B',
    code: 'DEV / 03',
  },
  {
    name: 'Harsh',
    role: 'Frontend',
    initials: 'H',
    code: 'DEV / 04',
  },
];

const sectionReveal = {
  hidden: {
    opacity: 0,
    y: 45,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_9px_rgba(0,255,135,0.75)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {children}
      </span>
    </div>
  );
}

function FeatureIcon({ type }) {
  if (type === 'mission') {
    return (
      <svg
        className="h-5 w-5 text-[#00FF87]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 3v18M3 12h18" strokeLinecap="round" />
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.5 15.5 12 12l3.5-3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'ai') {
    return (
      <svg
        className="h-5 w-5 text-[#00FF87]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path
          d="M8.5 12h7M12 8.5v7"
          strokeLinecap="round"
        />
        <path d="M9 4V2.5M15 4V2.5M9 21.5V20M15 21.5V20" />
      </svg>
    );
  }

  return (
    <svg
      className="h-5 w-5 text-[#00FF87]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
      <circle cx="18" cy="17" r="2.5" />
    </svg>
  );
}

export default function About() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020706] font-sans text-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden pt-32 sm:pt-36">
        <AmbientGlow className="left-1/2 top-0 h-[500px] w-[760px] -translate-x-1/2 -translate-y-1/2" />
        <AmbientGlow className="right-[-8%] top-[36%] h-[300px] w-[300px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-6 md:pb-32 lg:px-8">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-5xl"
          >
            <SectionLabel>About VyomAcre</SectionLabel>

            <h1 className="mt-7 max-w-4xl text-[clamp(3.4rem,8vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.065em]">
              We turn{' '}
              <span className="text-[#00FF87] [text-shadow:0_0_45px_rgba(0,255,135,0.12)]">
                overlooked space
              </span>{' '}
              into opportunity.
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              VyomAcre is an AI-powered space discovery platform designed to
              help rooftop owners unlock value and help businesses discover
              the right urban space with greater confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-20 flex items-center gap-4"
          >
            <span className="h-px w-16 bg-[#00FF87]/30" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              SPACE / AI / MARKETPLACE
            </span>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          MISSION / VALUES
      ========================================================= */}
      <section className="relative border-y border-white/10">
        <AmbientGlow className="left-[22%] top-1/2 h-[280px] w-[280px] -translate-y-1/2" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-28 lg:px-8">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-2xl"
          >
            <SectionLabel>What We Believe</SectionLabel>

            <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
              Infrastructure for a{' '}
              <span className="text-[#00FF87]">more discoverable city.</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-14 grid gap-4 lg:grid-cols-3"
          >
            {values.map((value) => (
              <motion.article
                key={value.number}
                variants={sectionReveal}
                whileHover={{
                  y: -5,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  },
                }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-xl transition-all duration-300 hover:border-[#00FF87]/20 hover:bg-white/[0.035] hover:shadow-[0_0_35px_rgba(0,255,135,0.045)] sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#00FF87]/[0.035] blur-[60px] transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00FF87]/15 bg-[#00FF87]/[0.045]">
                      <FeatureIcon type={value.icon} />
                    </div>

                    <span className="font-mono text-[10px] tracking-[0.16em] text-slate-600">
                      {value.number}
                    </span>
                  </div>

                  <p className="mt-10 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {value.eyebrow}
                  </p>

                  <h3 className="mt-3 max-w-sm text-2xl font-medium leading-tight tracking-[-0.04em] text-white">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {value.description}
                  </p>

                  <div className="mt-9 flex items-center gap-2">
                    <span className="h-px w-8 bg-[#00FF87]/40 transition-all duration-300 group-hover:w-12" />
                    <span className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                      VYOMACRE
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          TECH STACK
      ========================================================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-28 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <SectionLabel>Technology</SectionLabel>

              <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                Tech Stack
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                A modern foundation combining frontend velocity, AI
                intelligence, geospatial verification and reliable data
                infrastructure.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="flex flex-wrap gap-3"
            >
              {techStack.map((technology, index) => (
                <motion.div
                  key={technology}
                  variants={sectionReveal}
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                    transition: {
                      type: 'spring',
                      stiffness: 350,
                      damping: 22,
                    },
                  }}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:border-[#00FF87]/20 hover:bg-[#00FF87]/[0.035] hover:shadow-[0_0_20px_rgba(0,255,135,0.06)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87]/60 shadow-[0_0_7px_rgba(0,255,135,0.4)] transition-all duration-300 group-hover:bg-[#00FF87] group-hover:shadow-[0_0_9px_rgba(0,255,135,0.75)]" />

                  <span className="text-xs font-medium text-slate-300 transition-colors duration-300 group-hover:text-white">
                    {technology}
                  </span>

                  <span className="font-mono text-[8px] text-slate-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TEAM DEVDOOTS
      ========================================================= */}
      <section className="relative border-t border-white/10">
        <AmbientGlow className="right-[-8%] top-[15%] h-[360px] w-[360px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-32 lg:px-8">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <SectionLabel>Built By</SectionLabel>

            <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                  Team <span className="text-[#00FF87]">Devdoots</span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                  A focused team building the infrastructure behind VyomAcre's
                  next generation of urban space discovery.
                </p>
              </div>

              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                TEAM / DEVDOOTS / 2026
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {team.map((member) => (
              <motion.article
                key={member.name}
                variants={sectionReveal}
                whileHover={{
                  y: -4,
                  transition: {
                    type: 'spring',
                    stiffness: 320,
                    damping: 24,
                  },
                }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#00FF87]/20 hover:bg-white/[0.035]"
              >
                <div
                  aria-hidden="true"
                  className="absolute right-[-20px] top-[-20px] h-28 w-28 rounded-full bg-[#00FF87]/[0.035] blur-[45px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00FF87]/25 bg-[#00FF87]/[0.045] shadow-[0_0_22px_rgba(0,255,135,0.07)]">
                    <span className="text-lg font-semibold tracking-[-0.03em] text-[#00FF87]">
                      {member.initials}
                    </span>
                  </div>

                  <span className="font-mono text-[9px] tracking-[0.16em] text-slate-600">
                    {member.code}
                  </span>
                </div>

                <div className="relative mt-12">
                  <h3 className="text-lg font-medium tracking-[-0.025em] text-white">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {member.role}
                  </p>
                </div>

                <div className="relative mt-8 flex items-center gap-2">
                  <span className="h-px w-6 bg-[#00FF87]/35 transition-all duration-300 group-hover:w-10" />
                  <span className="text-[8px] uppercase tracking-[0.18em] text-slate-700">
                    ACTIVE CONTRIBUTOR
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          CLOSING STATEMENT
      ========================================================= */}
      <section className="relative overflow-hidden border-t border-white/10">
        <AmbientGlow className="left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-6 md:py-32">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-600">
              THE VYOMACRE PRINCIPLE
            </span>

            <h2 className="mt-6 text-3xl font-medium leading-tight tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
              Better discovery creates{' '}
              <span className="text-[#00FF87]">better possibilities.</span>
            </h2>
          </motion.div>
        </div>
      </section>
    </main>
  );
}