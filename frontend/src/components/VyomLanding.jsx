import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Existing UI Engine — preserved
import { useUI } from '../context/UIContext';

// Existing PreLoader — preserved
import PreLoader from './PreLoader';

const revealVariants = {
  hidden: {
    opacity: 0,
    y: 42,
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
      staggerChildren: 0.12,
    },
  },
};

const stats = [
  {
    value: '10+',
    label: 'Cities',
  },
  {
    value: '500+',
    label: 'Verified Roofs',
  },
  {
    value: 'AI',
    label: 'Property Verification',
  },
  {
    value: '24/7',
    label: 'Smart Discovery',
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'List Your Roof',
    description:
      'Add your rooftop details once. VyomAcre turns unused space into a structured digital property listing.',
  },
  {
    number: '02',
    title: 'AI Verifies It',
    description:
      'Our intelligent verification layer analyzes location, rooftop context and listing information before it reaches the marketplace.',
  },
  {
    number: '03',
    title: 'Get Discovered',
    description:
      'Businesses can discover suitable spaces, evaluate opportunities and connect with the right property owners.',
  },
];

const trustFeatures = [
  {
    index: '01',
    eyebrow: 'LOCATION INTELLIGENCE',
    title: 'Satellite-Verified Accuracy',
    description:
      'Turn raw rooftop listings into reliable location intelligence with verification designed to reduce uncertainty before a deal begins.',
    metric: 'HIGH CONFIDENCE',
    visual: 'satellite',
  },
  {
    index: '02',
    eyebrow: 'AI ASSISTANCE',
    title: 'AI-Powered Chat',
    description:
      'Ask questions, discover opportunities and navigate the platform through an intelligent assistant built around your property goals.',
    metric: 'SMART DISCOVERY',
    visual: 'ai',
  },
  {
    index: '03',
    eyebrow: 'MARKETPLACE SECURITY',
    title: 'Secure B2B Marketplace',
    description:
      'A structured environment for owners and businesses to discover, evaluate and pursue rooftop opportunities with greater confidence.',
    metric: 'BUILT FOR BUSINESS',
    visual: 'secure',
  },
];

function AmbientGlow({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute rounded-full bg-[#00FF87]/[0.06] blur-[120px] ' +
        className
      }
    />
  );
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_9px_rgba(0,255,135,0.8)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {children}
      </span>
    </div>
  );
}

function OrbitalLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-1/2 top-[41%] h-[520px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#00FF87]/[0.08]"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 70,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-1/2 top-[42%] h-[360px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#00FF87]/[0.05]"
      />

      <motion.div
        animate={{
          x: [0, 20, 0],
          opacity: [0.18, 0.34, 0.18],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-1/2 top-[38%] h-24 w-[580px] -translate-x-1/2 rounded-full bg-[#00FF87]/[0.08] blur-[90px]"
      />

      <div className="absolute left-[14%] top-[25%] h-1 w-1 rounded-full bg-[#00FF87]/70 shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
      <div className="absolute right-[18%] top-[32%] h-1.5 w-1.5 rounded-full bg-[#00FF87]/40 shadow-[0_0_12px_rgba(0,255,135,0.6)]" />
      <div className="absolute left-[22%] bottom-[24%] h-1 w-1 rounded-full bg-white/30" />
      <div className="absolute right-[13%] bottom-[31%] h-1 w-1 rounded-full bg-[#00FF87]/30" />
    </div>
  );
}

function FeatureVisual({ type }) {
  if (type === 'satellite') {
    return (
      <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-[#03100C]">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.025] shadow-[0_0_80px_rgba(0,255,135,0.12)]" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.04]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-[#00FF87]/20"
        />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FF87] shadow-[0_0_18px_rgba(0,255,135,0.9)]" />

        <div className="absolute bottom-5 left-5 rounded-lg border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
          <span className="block text-[9px] uppercase tracking-[0.18em] text-slate-500">
            Verification
          </span>
          <span className="mt-1 block font-mono text-xs text-[#00FF87]">
            SAT / GEO / AI
          </span>
        </div>

        <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.04] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.8)]" />
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#00FF87]">
            Verified
          </span>
        </div>
      </div>
    );
  }

  if (type === 'ai') {
    return (
      <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-[#03100C]">
        <AmbientGlow className="left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 space-y-2">
          <motion.div
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="ml-auto w-[68%] rounded-2xl rounded-br-sm border border-[#00FF87]/15 bg-[#00FF87]/[0.055] px-4 py-3"
          >
            <p className="text-[11px] leading-5 text-slate-300">
              Find rooftops suitable for a commercial solar setup.
            </p>
          </motion.div>

          <div className="w-[82%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.8)]" />
              <span className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Vyom AI
              </span>
            </div>
            <p className="text-[11px] leading-5 text-slate-300">
              I found verified opportunities matching your location and space
              requirements.
            </p>
          </div>

          <div className="flex items-center gap-1 px-2 pt-2">
            <span className="h-1 w-1 rounded-full bg-[#00FF87]/70" />
            <span className="h-1 w-1 rounded-full bg-[#00FF87]/40" />
            <span className="h-1 w-1 rounded-full bg-[#00FF87]/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-[#03100C]">
      <AmbientGlow className="right-[-10%] top-[-10%] h-64 w-64" />

      <div className="absolute inset-0 p-6">
        <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-slate-500">
                Marketplace
              </span>
              <span className="mt-1 block font-mono text-xs text-slate-300">
                ENCRYPTED CHANNEL
              </span>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.04]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-[#00FF87]"
              >
                <path d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4Z" />
                <path d="m9.5 12 1.7 1.7 3.8-4" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <span className="block text-[8px] uppercase tracking-wider text-slate-600">
                Listing
              </span>
              <span className="mt-2 block h-1 w-10 rounded-full bg-[#00FF87]/50" />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <span className="block text-[8px] uppercase tracking-wider text-slate-600">
                Owner
              </span>
              <span className="mt-2 block h-1 w-7 rounded-full bg-white/15" />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <span className="block text-[8px] uppercase tracking-wider text-slate-600">
                B2B
              </span>
              <span className="mt-2 block h-1 w-8 rounded-full bg-[#00FF87]/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VyomLanding() {
  const { finishLoading, isAppLoading } = useUI();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const handlePreLoaderComplete = () => {
    finishLoading();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#020706] font-sans text-white selection:bg-[#00FF87]/20 selection:text-white">
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <motion.div
            key="preloader"
            exit={{
              opacity: 0,
              y: -20,
              filter: 'blur(10px)',
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 z-[100]"
          >
            <PreLoader onComplete={handlePreLoaderComplete} />
          </motion.div>
        ) : (
          <motion.main
            key="main-content"
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
            className="w-full"
          >
            {/* =========================================================
                HERO
            ========================================================= */}
            <section className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden pt-28">
              <AmbientGlow className="left-1/2 top-[32%] h-[440px] w-[760px] -translate-x-1/2 -translate-y-1/2" />
              <AmbientGlow className="left-[-10%] top-[45%] h-[250px] w-[250px]" />
              <OrbitalLines />

              <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-24 text-center sm:px-6 lg:px-8">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="flex max-w-5xl flex-col items-center"
                >
                  <motion.div variants={revealVariants}>
                    <SectionLabel>AI-Powered Space Discovery</SectionLabel>
                  </motion.div>

                  <motion.h1
                    variants={revealVariants}
                    className="mt-7 max-w-5xl text-[clamp(3.2rem,8vw,7.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-white"
                  >
                    Turn Your Empty Roof{' '}
                    <span className="text-[#00FF87] [text-shadow:0_0_45px_rgba(0,255,135,0.12)]">
                      Into Revenue.
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={revealVariants}
                    className="mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base"
                  >
                    VyomAcre uses AI-powered verification and intelligent
                    discovery to connect valuable rooftop space with the
                    businesses looking for it.
                  </motion.p>

                  <motion.div
                    variants={revealVariants}
                    className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
                  >
                    <Link
                      to="/register"
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#00FF87] px-7 py-3.5 text-sm font-semibold text-[#020706] shadow-[0_0_25px_rgba(0,255,135,0.24)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(0,255,135,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706] sm:w-auto"
                    >
                      List Your Space
                      <svg
                        className="ml-2 h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>

                    <Link
                      to="/properties"
                      className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-7 py-3.5 text-sm font-medium text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30 sm:w-auto"
                    >
                      Explore Properties
                    </Link>
                  </motion.div>

                  <motion.div
                    variants={revealVariants}
                    className="mt-14 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-600"
                  >
                    <span className="h-px w-8 bg-white/10" />
                    <span>Built for owners & businesses</span>
                    <span className="h-px w-8 bg-white/10" />
                  </motion.div>
                </motion.div>

                {/* Hero Data Modules */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.75,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left backdrop-blur-xl transition-all duration-300 hover:border-[#00FF87]/15 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-medium tracking-[-0.04em] text-white">
                          {stat.value}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87]/60 shadow-[0_0_7px_rgba(0,255,135,0.5)] opacity-60 transition-opacity group-hover:opacity-100" />
                      </div>

                      <p className="mt-2 text-[10px] uppercase tracking-[0.13em] text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* =========================================================
                HOW IT WORKS
            ========================================================= */}
            <motion.section
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-120px' }}
              className="relative overflow-hidden border-y border-white/10"
            >
              <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-28 lg:px-8">
                <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                  <div>
                    <SectionLabel>How VyomAcre Works</SectionLabel>

                    <h2 className="mt-6 max-w-xl text-4xl font-medium leading-tight tracking-[-0.05em] text-white sm:text-5xl">
                      From unused space to{' '}
                      <span className="text-[#00FF87]">real opportunity.</span>
                    </h2>

                    <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
                      A simple flow connects rooftop owners with businesses
                      searching for valuable, verified space.
                    </p>
                  </div>

                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-3 md:grid-cols-3"
                  >
                    {workflowSteps.map((step) => (
                      <motion.article
                        key={step.number}
                        variants={revealVariants}
                        className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl transition-colors duration-300 hover:border-[#00FF87]/15"
                      >
                        <span className="font-mono text-xs text-[#00FF87]/70">
                          {step.number}
                        </span>

                        <h3 className="mt-8 text-lg font-medium tracking-[-0.025em] text-white">
                          {step.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {step.description}
                        </p>

                        <div className="mt-8 h-px w-10 bg-[#00FF87]/35" />
                      </motion.article>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* =========================================================
                TRUST / FEATURES
            ========================================================= */}
            <section className="relative overflow-hidden">
              <AmbientGlow className="right-[-12%] top-[25%] h-[400px] w-[400px]" />

              <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-32 lg:px-8">
                <motion.div
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-120px' }}
                  className="max-w-2xl"
                >
                  <SectionLabel>Trust Infrastructure</SectionLabel>

                  <h2 className="mt-6 text-4xl font-medium leading-tight tracking-[-0.05em] text-white sm:text-5xl">
                    Built to make{' '}
                    <span className="text-[#00FF87]">space discoverable.</span>
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                    Every part of the experience is designed to reduce
                    uncertainty and make rooftop opportunities easier to find,
                    understand and act on.
                  </p>
                </motion.div>

                <div className="mt-14 space-y-4">
                  {trustFeatures.map((feature, index) => (
                    <motion.article
                      key={feature.index}
                      initial={{
                        opacity: 0,
                        y: 45,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        margin: '-100px',
                      }}
                      transition={{
                        duration: 0.75,
                        delay: index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
                    >
                      <div className="grid lg:grid-cols-[1fr_0.95fr]">
                        <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-11">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-[#00FF87]/65">
                                {feature.index}
                              </span>

                              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
                                {feature.eyebrow}
                              </span>
                            </div>

                            <h3 className="mt-16 max-w-md text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl">
                              {feature.title}
                            </h3>

                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                              {feature.description}
                            </p>
                          </div>

                          <div className="mt-12 flex items-center gap-3">
                            <span className="h-px w-8 bg-[#00FF87]/40" />
                            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
                              {feature.metric}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-white/10 lg:border-l lg:border-t-0">
                          <FeatureVisual type={feature.visual} />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </section>

            {/* =========================================================
                FINAL CTA
            ========================================================= */}
            <section className="relative overflow-hidden border-t border-white/10">
              <AmbientGlow className="left-1/2 top-1/2 h-[480px] w-[760px] -translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-32 lg:px-8">
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 45,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: '-120px',
                  }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-16 text-center backdrop-blur-xl sm:px-10 md:py-20"
                >
                  <OrbitalLines />

                  <div className="relative z-10 mx-auto max-w-3xl">
                    <SectionLabel>Next Move</SectionLabel>

                    <h2 className="mt-6 text-4xl font-medium leading-tight tracking-[-0.055em] text-white sm:text-5xl md:text-6xl">
                      Ready to{' '}
                      <span className="text-[#00FF87]">
                        Monetize Your Roof?
                      </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                      Put your unused rooftop to work or discover your next
                      high-value space with VyomAcre.
                    </p>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Link
                        to="/register"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#00FF87] px-7 py-3.5 text-sm font-semibold text-[#020706] shadow-[0_0_25px_rgba(0,255,135,0.22)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(0,255,135,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706] sm:w-auto"
                      >
                        List Your Space
                        <svg
                          className="ml-2 h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M5 12h14M13 6l6 6-6 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>

                      <Link
                        to="/properties"
                        className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-black/20 px-7 py-3.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30 sm:w-auto"
                      >
                        Explore Properties
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}