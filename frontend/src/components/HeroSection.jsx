```jsx id="j7o8mq"
import React from 'react';
import { motion } from 'framer-motion';
import HeroBackground from './HeroBackground';

export default function HeroSection() {
  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center pt-28 pb-20 text-center">
      {/* Cinematic Background Lighting Component */}
      <HeroBackground />

      {/* Hero Headline with Staggered Entrance */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mb-6 max-w-6xl text-5xl font-medium tracking-[-0.06em] text-white drop-shadow-2xl md:text-7xl lg:text-8xl"
      >
        Welcome to{' '}
        <span className="text-white">
          Vyom
        </span>
        <span className="text-[#00FF87] drop-shadow-[0_0_25px_rgba(0,255,135,0.25)]">
          Acre
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto mb-16 max-w-2xl px-4 text-lg leading-8 text-slate-400 md:text-xl"
      >
        AI-Powered Space Discovery Platform. Connecting Empty Spaces with the
        Right Opportunities.
      </motion.p>

      {/* Premium Tutorial Video Placeholder */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 40,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative mx-auto flex aspect-video w-full max-w-5xl items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-[0_30px_70px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      >
        {/* Glassmorphism Inner Reflection */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-[#00FF87]/[0.045]" />

        {/* Top Edge Highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-[#00FF87]/30 to-transparent"
        />

        {/* Cinematic Center Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FF87]/[0.035] blur-[90px]"
        />

        {/* Small HUD Metadata */}
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-[#020706]/60 px-3 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.75)]" />
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
            VyomAcre / Tutorial
          </span>
        </div>

        <div className="absolute bottom-5 right-5 z-10 hidden rounded-full border border-white/10 bg-[#020706]/60 px-3 py-1.5 backdrop-blur-md sm:block">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
            SYSTEM GUIDE
          </span>
        </div>

        {/* Play Control Indicator with Breathing Animation */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 360,
            damping: 24,
          }}
          className="relative z-10 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#020706]/80 shadow-[0_15px_45px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 group-hover:border-[#00FF87]/60 group-hover:shadow-[0_0_50px_rgba(0,255,135,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706]"
          aria-label="Play Tutorial"
        >
          {/* Breathing Glow */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-[#00FF87]/20 blur-lg"
          />

          {/* Inner Ring */}
          <span
            aria-hidden="true"
            className="absolute inset-[5px] rounded-full border border-[#00FF87]/10 transition-colors duration-300 group-hover:border-[#00FF87]/25"
          />

          <svg
            aria-hidden="true"
            className="relative z-10 ml-1.5 h-10 w-10 text-[#00FF87] drop-shadow-[0_0_10px_rgba(0,255,135,0.6)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}
```
