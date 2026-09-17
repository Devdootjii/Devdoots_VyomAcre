import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const platformLinks = [
  { label: 'Properties', path: '/properties' },
  { label: 'List Your Roof', path: '/register' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Admin', path: '/admin' },
];

const companyLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Help Center', path: '/help' },
  { label: 'Privacy Policy', path: '/privacy' },
];

const linkVariants = {
  rest: {
    x: 0,
  },
  hover: {
    x: 3,
  },
};

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-[#020706] text-white">
      {/* Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FF87]/[0.035] blur-[140px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#00FF87]/[0.025] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-12 lg:gap-20">
          {/* Brand Column */}
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="VyomAcre home"
              className="group inline-flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/40"
            >
              <motion.div
                whileHover={{ y: -1 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 26,
                }}
                className="relative flex items-center"
              >
                <span className="text-2xl font-semibold tracking-[-0.045em] text-white sm:text-[1.7rem]">
                  Vyom
                </span>

                <span className="text-2xl font-semibold tracking-[-0.045em] text-[#00FF87] sm:text-[1.7rem]">
                  Acre
                </span>

                <span
                  aria-hidden="true"
                  className="absolute -inset-x-3 -inset-y-2 -z-10 rounded-full bg-[#00FF87]/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
                />
              </motion.div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              AI-Powered Space Discovery — turning empty rooftops into revenue.
            </p>

            {/* Small Status Indicator */}
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF87] opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00FF87]" />
              </span>

              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Platform Online
              </span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">
              PLATFORM
            </h3>

            <ul className="mt-6 space-y-3.5">
              {platformLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
                  >
                    <motion.span
                      initial="rest"
                      whileHover="hover"
                      variants={linkVariants}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="text-sm font-medium text-slate-300 transition-colors duration-200 group-hover:text-[#00FF87]"
                    >
                      {item.label}
                    </motion.span>

                    <span
                      aria-hidden="true"
                      className="ml-1.5 h-px w-0 bg-[#00FF87]/60 shadow-[0_0_5px_rgba(0,255,135,0.5)] transition-all duration-300 group-hover:w-3"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">
              COMPANY
            </h3>

            <ul className="mt-6 space-y-3.5">
              {companyLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
                  >
                    <motion.span
                      initial="rest"
                      whileHover="hover"
                      variants={linkVariants}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="text-sm font-medium text-slate-300 transition-colors duration-200 group-hover:text-[#00FF87]"
                    >
                      {item.label}
                    </motion.span>

                    <span
                      aria-hidden="true"
                      className="ml-1.5 h-px w-0 bg-[#00FF87]/60 shadow-[0_0_5px_rgba(0,255,135,0.5)] transition-all duration-300 group-hover:w-3"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-white/10 lg:my-16" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span className="text-slate-500">
              © 2026 VyomAcre. All rights reserved.
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block"
            />

            <span className="text-slate-600">
              Built by{' '}
              <span className="text-slate-400 transition-colors duration-200 hover:text-[#00FF87]">
                Team Devdoots
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              VYOM // SYSTEM
            </span>

            <span className="h-1 w-1 rounded-full bg-[#00FF87]/60 shadow-[0_0_6px_rgba(0,255,135,0.5)]" />

            <span className="text-[10px] uppercase tracking-[0.14em]">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Oversized Atmospheric Branding */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-6vw] left-0 flex w-full select-none items-end justify-center overflow-hidden opacity-80"
      >
        <span
          className="whitespace-nowrap text-center font-black leading-none tracking-[-0.07em] text-transparent"
          style={{
            fontSize: 'clamp(6rem, 15vw, 15rem)',
            WebkitTextStroke: '1px rgba(0, 255, 135, 0.08)',
          }}
        >
          VyomAcre
        </span>
      </div>
    </footer>
  );
}