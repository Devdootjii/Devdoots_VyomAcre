/**
 * ============================================================================
 * VYOMACRE MAIN LANDING PAGE (CONNECTED WITH GLOBAL UI ENGINE)
 * ============================================================================
 * Yeh component humari website ka front-door hai.
 * Yahan hum Splash Screen (PreLoader) ko render karte hain aur uske khatam 
 * hone par Global Context API ko signal bhejte hain ki "App load ho chuki hai, 
 * ab Chatbot aur baaki UI elements ko screen par dikha do."
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. UI Engine Hook Import
import { useUI } from '../context/UIContext';

// 2. Existing Components Import
import PreLoader from './PreLoader';
import HeroSection from './HeroSection';
import CityTrust from './CityTrust';

export default function VyomLanding() {
  // --------------------------------------------------------------------------
  // GLOBAL STATE CONNECTION
  // --------------------------------------------------------------------------
  // UI Engine se 'finishLoading' action aur 'isAppLoading' state nikal rahe hain.
  const { finishLoading, isAppLoading } = useUI();

  // Local state taaki page content fade-in ho sake jab loader hate.
  const [showContent, setShowContent] = useState(false);

  // --------------------------------------------------------------------------
  // EFFECTS: PREMIUM SMOOTH SCROLLING
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Jab user page scroll karega, toh ekdum buttery smooth glide feel aayega
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      // Clean-up: Jab user kisi aur page par jaye, toh default behavior wapas aa jaye
      document.documentElement.style.scrollBehavior = 'auto'; 
    };
  }, []);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  /**
   * Ye function tab trigger hoga jab PreLoader apna kaam (animation) khatam kar lega.
   */
  const handlePreLoaderComplete = () => {
    // 1. Local state update: Page content dikhana shuru karo
    setShowContent(true);
    
    // 2. Global state update (Context API): Chatbot ko bahar aane ka signal do
    finishLoading();
  };

  // ==========================================================================
  // RENDER UI
  // ==========================================================================
  return (
    <div className="relative w-full min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-white font-sans">
      
      {/* 
        ANIMATE PRESENCE: 
        Ye Framer Motion ka component hai jo elements ko smoothly DOM se remove 
        aur add karne me madad karta hai. Iske bina exit animations kaam nahi karte.
      */}
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          /* 
            STEP 1: SPLASH SCREEN (PRE-LOADER)
            Jab tak global state true hai, ye chalega. Iske onComplete prop me 
            humne apna handler pass kar diya hai.
          */
          <motion.div
            key="preloader"
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} // Premium exit blur effect
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-[100]"
          >
            <PreLoader onComplete={handlePreLoaderComplete} />
          </motion.div>
        ) : (
          /* 
            STEP 2: MAIN PAGE CONTENT
            PreLoader hatne ke baad ye section fade-in hokar aayega.
          */
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="w-full flex flex-col items-center"
          >
            
            {/* ==========================================
                HERO SECTION (Top Viewport)
            ========================================== */}
            <section 
              id="hero-section" 
              className="w-full max-w-[100vw] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-28 md:pb-20 flex flex-col justify-center min-h-[90vh] lg:min-h-[85vh] relative z-10"
            >
              <HeroSection />
            </section>
            
            {/* ==========================================
                CITY TRUST SECTION (B2B Social Proof)
                Premium Touch: Darker gradient background for depth
            ========================================== */}
            <section 
              id="trust-section" 
              className="w-full max-w-[100vw] relative z-20 bg-gradient-to-b from-[#0B1120]/60 to-[#030712] border-t border-slate-800/40"
            >
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <CityTrust />
              </div>
            </section>

            {/* ==========================================
                FOOTER (Placeholder for Future)
            ========================================== */}
            <footer className="w-full border-t border-slate-800/40 bg-[#030712] py-8 text-center mt-auto relative z-20">
              <p className="text-sm text-slate-500 md:text-base tracking-wide">
                © 2026 VyomAcre. Empowering Rooftops, Energizing Cities.
              </p>
            </footer>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        BACKGROUND GLOW EFFECTS (Premium Cyberpunk Vibe)
        Ye divs background me ek bahut subtle blur glow create karte hain,
        jis-se website flat lagne ki bajaye 3D aur premium lagti hai.
      */}
      {!isAppLoading && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Top Right Cyan Glow */}
          <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#00B8FF]/5 blur-[120px]" />
          {/* Bottom Left Green Glow */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#00FF87]/5 blur-[120px]" />
        </div>
      )}
    </div>
  );
}