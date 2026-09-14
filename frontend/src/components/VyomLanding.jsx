import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// UI Engine Hook Import
import { useUI } from '../context/UIContext';

// Existing Components Import
import PreLoader from './PreLoader';
import HeroSection from './HeroSection';
import CityTrust from './CityTrust';

export default function VyomLanding() {
  const { finishLoading, isAppLoading } = useUI();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'; 
    };
  }, []);

  const handlePreLoaderComplete = () => {
    setShowContent(true);
    finishLoading();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-white font-sans">
      
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <motion.div
            key="preloader"
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} 
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-[100]"
          >
            <PreLoader onComplete={handlePreLoaderComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="w-full flex flex-col items-center"
          >
            
            {/* HERO SECTION */}
            <section 
              id="hero-section" 
              className="w-full max-w-[100vw] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-28 md:pb-20 flex flex-col justify-center min-h-[90vh] lg:min-h-[85vh] relative z-10"
            >
              <HeroSection />
            </section>
            
            {/* CITY TRUST SECTION */}
            <section 
              id="trust-section" 
              className="w-full max-w-[100vw] relative z-20 bg-gradient-to-b from-[#0B1120]/60 to-[#030712] border-t border-slate-800/40"
            >
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <CityTrust />
              </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full border-t border-slate-800/40 bg-[#030712] py-8 text-center mt-auto relative z-20">
              <p className="text-sm text-slate-500 md:text-base tracking-wide">
                © 2026 VyomAcre. Empowering Rooftops, Energizing Cities.
              </p>
            </footer>

          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKGROUND GLOW EFFECTS */}
      {!isAppLoading && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#00B8FF]/5 blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#00FF87]/5 blur-[120px]" />
        </div>
      )}
    </div>
  );
}