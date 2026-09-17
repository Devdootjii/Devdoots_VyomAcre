import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PreLoader({ onComplete }) {
  // Existing lifecycle logic preserved: completes under 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#020706] text-white selection:bg-[#00FF87]/20">
      {/* Ambient Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FF87]/[0.045] blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-[20%] h-64 w-64 rounded-full bg-[#00FF87]/[0.02] blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] right-[-8%] h-72 w-72 rounded-full bg-[#00FF87]/[0.02] blur-[110px]"
      />

      {/* Subtle HUD Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Cinematic Orbit Rings */}
      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none absolute h-52 w-52 rounded-full border border-[#00FF87]/[0.08]"
      />

      <motion.div
        aria-hidden="true"
        animate={{ rotate: -360 }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none absolute h-72 w-72 rounded-full border border-white/[0.04]"
      />

      {/* Main Branding */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Central Brand Mark */}
        <motion.div
          initial={{
            scale: 0.7,
            opacity: 0,
            rotate: -8,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mb-7 flex items-center justify-center"
        >
          {/* Outer Glow */}
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.18, 0.32, 0.18],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-[-18px] rounded-[1.5rem] bg-[#00FF87]/20 blur-[35px]"
          />

          {/* Icon Container */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00FF87]/30 bg-[#00FF87] shadow-[0_0_30px_rgba(0,255,135,0.3)]">
            <svg
              aria-hidden="true"
              className="h-8 w-8 text-[#020706]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M12 3 4.5 18h15L12 3Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 14h5"
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Highlight */}
            <span
              aria-hidden="true"
              className="absolute inset-[2px] rounded-[0.85rem] border border-white/20"
            />
          </div>
        </motion.div>

        {/* Brand Text */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 15,
            filter: 'blur(5px)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          transition={{
            delay: 0.35,
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-4xl font-semibold tracking-[-0.055em] drop-shadow-[0_0_12px_rgba(0,255,135,0.3)] sm:text-5xl"
        >
          <span className="text-white">Vyom</span>
          <span className="text-[#00FF87]">Acre</span>
        </motion.h1>

        {/* Loading Meta */}
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.7,
            duration: 0.4,
            ease: 'easeOut',
          }}
          className="mt-5 flex items-center gap-2"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF87] opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.75)]" />
          </span>

          <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-600">
            Initializing Discovery Engine
          </span>
        </motion.div>

        {/* Progress Line */}
        <motion.div
          initial={{
            opacity: 0,
            scaleX: 0,
          }}
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            delay: 0.8,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-6 h-px w-28 origin-center overflow-hidden bg-white/10"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#00FF87] to-transparent shadow-[0_0_8px_rgba(0,255,135,0.7)]"
          />
        </motion.div>
      </div>

      {/* Corner HUD Metadata */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-6 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700 sm:block"
      >
        VYOM / CORE
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-6 right-6 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-slate-700 sm:block"
      >
        SYSTEM ONLINE
      </div>
    </div>
  );
}