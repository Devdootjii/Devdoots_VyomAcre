import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const brandLetters = "VyomAcre".split("");

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="w-full bg-[#030712]/90 backdrop-blur-xl border-b border-slate-800/80 fixed top-0 z-[50] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* FAR LEFT: Brand Logo with Interactive Pop-out Letters & Scroll-to-Top Handler */}
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="/" 
              onClick={handleLogoClick}
              id="brand-logo-interactive" 
              className="flex items-center text-2xl font-bold tracking-wide cursor-pointer group py-2"
            >
              {brandLetters.map((letter, index) => (
                <motion.span
                  key={index}
                  whileHover={{ 
                    scale: 1.35, 
                    y: -4,
                    filter: "drop-shadow(0 0 12px rgba(0, 255, 135, 0.9))"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-[#00B8FF]"
                >
                  {letter}
                </motion.span>
              ))}
            </a>
          </div>

          {/* CENTER: Main Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-10">
            <Link to="/register" className="text-sm font-medium text-slate-300 hover:text-[#00FF87] transition-colors">Registration</Link>
            <Link to="/properties" className="text-sm font-medium text-slate-300 hover:text-[#00FF87] transition-colors">Properties</Link>
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-[#00FF87] transition-colors">About</Link>
            <Link to="/help" className="text-sm font-medium text-slate-300 hover:text-[#00FF87] transition-colors">Help</Link>
          </div>

          {/* FAR RIGHT: Authentication Controls */}
          <div className="hidden md:flex items-center space-x-5">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
              Log In
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-semibold bg-gradient-to-r from-[#00FF87] to-[#00B8FF] text-slate-950 px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(0,255,135,0.3)] hover:shadow-[0_0_25px_rgba(0,184,255,0.5)] transition-all"
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0B1120] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3"
        >
          <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Registration</Link>
          <Link to="/properties" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Properties</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">About</Link>
          <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Help</Link>
          <div className="pt-2 flex flex-col gap-2">
            <button className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700">Log In</button>
            <button className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#00FF87] to-[#00B8FF]">Sign Up</button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}