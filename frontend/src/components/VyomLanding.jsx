import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Existing UI Engine Hook preserved entirely
import { useUI } from '../context/UIContext';

// Existing Components
import PreLoader from './PreLoader';
import HeroSection from './HeroSection';
import CityTrust from './CityTrust';
import Footer from './Footer';

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
    <div className="relative w-full min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-[#00B8FF]/30 selection:text-white font-sans">
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
              className="w-full max-w-[100vw] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 md:pt-28 md:pb-28 flex flex-col justify-center min-h-[90vh] relative z-10"
            >
              <HeroSection />
            </section>
            
            {/* CITY TRUST SECTION WITH SCROLL ANIMATION REVEAL */}
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              id="trust-section" 
              className="w-full max-w-[100vw] relative z-20 py-16 md:py-24 border-t border-slate-800/50 bg-[#030712]"
            >
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <CityTrust />
              </div>
            </motion.section>
            
            {/* FOOTER */}
            <Footer />
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}