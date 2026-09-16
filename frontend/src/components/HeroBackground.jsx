```jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
      {/* Deep Space Base Atmosphere */}
      <div className="absolute inset-0 bg-[#020706]" />

      {/* Primary Neon Green Massive Glow — Top Right */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: 0.65,
        }}
        transition={{
          scale: {
            duration: 10,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          },
          opacity: {
            duration: 1.5,
            ease: 'easeOut',
          },
        }}
        className="absolute right-[-5%] top-[-10%] h-[55vw] w-[55vw] rounded-full bg-[#00FF87]/20 blur-[130px]"
      />

      {/* Secondary Emerald / Deep Space Glow — Bottom Left */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: 0.6,
        }}
        transition={{
          scale: {
            duration: 12,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: 1,
          },
          opacity: {
            duration: 1.5,
            ease: 'easeOut',
            delay: 0.2,
          },
        }}
        className="absolute bottom-[-10%] left-[-5%] h-[55vw] w-[55vw] rounded-full bg-[#00FF87]/[0.14] blur-[130px]"
      />

      {/* Deep Emerald Core Atmosphere */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[34vw] w-[34vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#003F30]/[0.22] blur-[120px]"
      />

      {/* Subtle Neon Bridge Between Light Sources */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,255,135,0.035),transparent_42%)]"
      />

      {/* Bottom Fade Bridge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-[#020706]/55 to-[#020706]"
      />

      {/* Edge Darkening */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,7,6,0.38)_100%)]"
      />
    </div>
  );
}
```
