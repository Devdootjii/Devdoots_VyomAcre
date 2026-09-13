import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PreLoader({ onComplete }) {
  // Yeh timer 2.5 seconds baad parent component ko batayega ki animation khatam ho gayi
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      // Screen ko poora dark background se cover karega (z-50 sabse upar rakhne ke liye)
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <motion.div
        // Logo chote se bada hoga aur fade-in hoga
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Vyom<span className="text-cyan-400">Acre</span>
        </h1>
      </motion.div>
    </motion.div>
  );
}