import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#030712] border-t border-slate-800/40 pt-16 pb-12 overflow-hidden z-20 text-white selection:bg-[#00B8FF]/30">
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-12 mb-32 md:mb-48">
        
        {/* Brand & Newsletter Column */}
        <div className="w-full md:w-1/3">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00FF87] to-[#00B8FF] mb-4">
            VyomAcre
          </h3>
          <p className="text-slate-400 mb-6 text-sm max-w-sm leading-relaxed">
            AI-Powered Space Discovery Platform. Empowering Rooftops, Energizing Cities.
          </p>
          <div className="flex w-full max-w-md items-center gap-2">
            <input 
              type="email" 
              placeholder="youremail@domain.com" 
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00B8FF] focus:ring-1 focus:ring-[#00B8FF] transition-all placeholder:text-slate-600"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-slate-200 transition-colors shadow-lg"
            >
              Subscribe
            </motion.button>
          </div>
        </div>

        {/* Navigation Links Grid */}
        <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[#00FF87] font-bold text-xs tracking-wider uppercase mb-5">Products</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Agent</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#00FF87] font-bold text-xs tracking-wider uppercase mb-5">Navigation</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#00FF87] font-bold text-xs tracking-wider uppercase mb-5">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#00FF87] font-bold text-xs tracking-wider uppercase mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partnerships</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300 transition-colors underline underline-offset-4">Legal</a>
          <a href="#" className="hover:text-slate-300 transition-colors underline underline-offset-4">Privacy Policy</a>
        </div>
        <span className="mt-4 md:mt-0 tracking-wide">VyomAcre Inc. © 2026</span>
      </div>

      {/* THE CODERABBIT EFFECT: Massive Hollow Branding Text */}
      <div className="absolute bottom-0 left-0 w-full text-center z-0 pointer-events-none select-none flex items-end justify-center overflow-hidden">
        <span 
          className="font-black text-transparent leading-none translate-y-[20%]"
          style={{ 
            fontSize: '15vw', 
            WebkitTextStroke: '2px rgba(0, 184, 255, 0.3)' 
          }}
        >
          VyomAcre
        </span>
      </div>
    </footer>
  );
}