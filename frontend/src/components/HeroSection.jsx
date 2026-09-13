import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    // Yeh section 'snap-start' ke sath hai taaki scroll hone par yahan lock ho jaye
    <section className="relative w-full min-h-screen bg-slate-950 overflow-hidden flex flex-col items-center pt-20 snap-start">
      
      {/* TOP HALF CIRCLE (Welcome Text) */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-[150%] md:w-[80%] h-[400px] border-b border-cyan-500/20 rounded-b-[50%] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(34,211,238,0.05)]"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 z-10">
          Welcome to <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">VyomAcre</span>
        </h1>
        <p className="text-slate-400 text-center max-w-lg px-4 z-10">
          AI-Powered Space Discovery Platform. Connecting Empty Spaces with the Right Opportunities.
        </p>
      </motion.div>

      {/* BOTTOM HALF CIRCLE & 3 PREMIUM CARDS */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative w-[150%] md:w-[90%] flex-1 border-t border-emerald-500/20 rounded-t-[50%] bg-gradient-to-t from-slate-950 to-slate-900 mt-10 pt-10 px-10 flex flex-col items-center shadow-[0_-20px_50px_rgba(16,185,129,0.05)]"
      >
        {/* CARDS CONTAINER (Upar ki taraf khiska hua -mt-24) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full -mt-24 z-20 px-10 md:px-0">
          
          {/* Card 1: Registration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:-translate-y-2 transition-transform duration-300">
            {/* Background Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            {/* Bottom Glowing Border */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-2xl shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
            
            <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-cyan-500/30 mb-4 shadow-[0_0_10px_rgba(34,211,238,0.2)] text-2xl">
              📝
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Registration</h3>
            <p className="text-sm text-slate-400 relative z-10">List your roof or plot easily. AI-verified and secure onboarding process.</p>
          </div>

          {/* Card 2: Properties */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-b-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            
            <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-emerald-500/30 mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)] text-2xl">
              🏢
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Properties</h3>
            <p className="text-sm text-slate-400 relative z-10">Explore premium verified spaces. Dynamic map interface for B2B clients.</p>
          </div>

          {/* Card 3: About */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-b-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            
            <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-indigo-500/30 mb-4 shadow-[0_0_10px_rgba(99,102,241,0.2)] text-2xl">
              ℹ️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">About Us</h3>
            <p className="text-sm text-slate-400 relative z-10">Learn about our trusted partners, vision, and how we empower space owners.</p>
          </div>

        </div>
      </motion.div>
    </section>
  );
}