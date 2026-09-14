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
    <div className="flex flex-col items-center justify-center h-screen w-full bg-[#030712] text-white overflow-hidden selection:bg-cyan-500/30">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center mb-6"
      >
        {/* Subtle Brand Glow Behind Icon */}
        <div className="absolute inset-0 bg-[#00FF87] blur-[40px] opacity-30 rounded-full"></div>
        
        {/* Central Glowing Element */}
        <div className="relative h-16 w-16 bg-gradient-to-br from-[#00FF87] to-[#00B8FF] rounded-xl shadow-[0_0_25px_rgba(0,184,255,0.4)] flex items-center justify-center border border-white/20">
          <svg className="w-8 h-8 text-[#030712]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2z"/>
          </svg>
        </div>
      </motion.div>

      {/* Brand Text Fade-in */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-[#00B8FF] drop-shadow-[0_0_10px_rgba(0,184,255,0.2)]"
      >
        VyomAcre
      </motion.h1>
    </div>
  );
}