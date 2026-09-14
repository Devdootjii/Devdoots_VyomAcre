import React from 'react';
import { motion } from 'framer-motion';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
      {/* Cyber Cyan Massive Glowing Sphere (Top Right) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: 0.65 }}
        transition={{ 
          scale: { duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
          opacity: { duration: 1.5, ease: "easeOut" }
        }}
        className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-[#00B8FF]/35 blur-[130px]"
      />

      {/* Neon Green Massive Glowing Sphere (Bottom Left) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.08, 1], opacity: 0.6 }}
        transition={{ 
          scale: { duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1 },
          opacity: { duration: 1.5, ease: "easeOut", delay: 0.2 }
        }}
        className="absolute bottom-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-[#00FF87]/30 blur-[130px]"
      />

      {/* Center Ambient Light Bridge */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712] pointer-events-none" />
    </div>
  );
}