import React from 'react';
import { motion } from 'framer-motion';
import HeroBackground from './HeroBackground';

export default function HeroSection() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center pt-28 pb-20 z-10 text-center">
      
      {/* Cinematic Background Lighting Component */}
      <HeroBackground />

      {/* Hero Headline with Staggered Entrance */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight"
      >
        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-[#00B8FF] drop-shadow-[0_0_20px_rgba(0,184,255,0.4)]">VyomAcre</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 px-4"
      >
        AI-Powered Space Discovery Platform. Connecting Empty Spaces with the Right Opportunities.
      </motion.p>

      {/* Premium Tutorial Video Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl mx-auto aspect-video rounded-3xl border border-slate-700/60 bg-[#0B1120]/80 backdrop-blur-2xl shadow-[0_30px_70px_-15px_rgba(0,184,255,0.2)] flex items-center justify-center group overflow-hidden"
      >
        {/* Glassmorphism inner reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-[#00B8FF]/10 pointer-events-none"></div>
        
        {/* Play Control Indicator with Breathing Animation */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-slate-900/90 border border-slate-600 shadow-2xl backdrop-blur-md transition-all group-hover:border-[#00FF87] group-hover:shadow-[0_0_50px_rgba(0,255,135,0.5)] cursor-pointer"
          aria-label="Play Tutorial"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00FF87]/30 to-[#00B8FF]/30 blur-lg"
          />
          <svg className="w-10 h-10 text-[#00FF87] ml-1.5 relative z-10 drop-shadow-[0_0_10px_rgba(0,255,135,0.6)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}