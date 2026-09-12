import React from 'react';
import { motion } from 'framer-motion';

export default function CityTrust() {
  // Demo data for cities (Isko aage chalkar backend se connect kar sakte hain)
  const cities = [
    { name: 'Lucknow', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600&auto=format&fit=crop', properties: '150+ Verified Spaces' },
    { name: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1585150403152-225b1fe50e27?q=80&w=600&auto=format&fit=crop', properties: '320+ Verified Spaces' },
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=600&auto=format&fit=crop', properties: '210+ Verified Spaces' },
    { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop', properties: '180+ Verified Spaces' },
  ];

  return (
    // 'snap-start' lagaya hai taaki Hero section se scroll karte hi page yahan lock ho jaye
    <section className="relative w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center py-20 snap-start px-6 z-10">
      
      {/* 🌟 Heading Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          Trusted Across <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Major Cities</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Our network of premium verified spaces is growing rapidly. See where VyomAcre is making an impact and connecting B2B clients with the right opportunities.
        </p>
      </motion.div>

      {/* 🏙️ City Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {cities.map((city, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative rounded-2xl overflow-hidden cursor-pointer h-[350px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-800 hover:border-cyan-500/50 transition-colors duration-300"
          >
            {/* Background Image (Hover par zoom hoga) */}
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-70"
            />
            
            {/* Dark Gradient Overlay (Text ko clearly dikhane ke liye) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            
            {/* Text Content */}
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300">
                {city.name}
              </h3>
              <p className="text-sm font-medium text-emerald-400">{city.properties}</p>
              
              {/* Hover Line Animation */}
              <div className="h-0.5 w-0 bg-cyan-400 mt-3 transition-all duration-500 group-hover:w-full"></div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </section>
  );
}