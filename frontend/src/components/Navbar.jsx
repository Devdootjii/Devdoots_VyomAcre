import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    // Fixed aur blur background (Glassmorphism effect)
    <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LEFT SIDE: Login & Sign Up */}
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-300">
            Log in
          </button>
          <button className="text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 px-5 py-2 rounded-full hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            Sign Up
          </button>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/register" className="text-sm font-medium text-slate-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">
            Registration
          </Link>
          <Link to="/properties" className="text-sm font-medium text-slate-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">
            Properties
          </Link>
          <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">
            About
          </Link>
          <Link to="/help" className="text-sm font-medium text-slate-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">
            Help
          </Link>
        </div>

        {/* RIGHT SIDE: Company Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Vyom<span className="text-cyan-400">Acre</span>
        </Link>

      </div>
    </nav>
  );
}