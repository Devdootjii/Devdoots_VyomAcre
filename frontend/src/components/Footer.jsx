import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

/* ============================================================
   VyomAcre — Footer (fire edition)
   - Social links: GitHub, Discord, Instagram, Email
   - Big VyomAcre wordmark — fully visible, green fire behind
   - Theme matched to landing (#050A08 / #00E585)
   ============================================================ */

/* ---------- brand icons (inline SVG, version-safe) ---------- */
const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const DiscordIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const socials = [
  { label: 'GitHub', href: 'https://github.com/Devdootjii/Devdoots_VyomAcre', Icon: GithubIcon },
  { label: 'Discord', href: 'https://discord.gg/7EY6Udkmf', Icon: DiscordIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/devdootjii/?hl=en', Icon: InstagramIcon },
  { label: 'Email', href: 'mailto:kdivyansh453@gmail.com', Icon: Mail },
];

const platformLinks = [
  { label: 'Properties', path: '/properties' },
  { label: 'List Your Roof', path: '/register' },
  { label: 'Dashboard', path: '/portal' },
  { label: 'Admin', path: '/admin' },
];

const companyLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Help Center', path: '/help' },
];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-[#121D17] bg-[#050A08] text-[#E7EFE9]">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
@keyframes vyflicker {
  0%, 100% { transform: scale(1, 1); opacity: 1; }
  25% { transform: scale(0.94, 1.12); opacity: 0.85; }
  50% { transform: scale(1.05, 0.92); opacity: 0.95; }
  75% { transform: scale(0.97, 1.06); opacity: 0.8; }
}
@keyframes vyember {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  12% { opacity: 1; }
  100% { transform: translateY(-170px) scale(0.2); opacity: 0; }
}
.vy-firemark {
  font-family: 'Space Grotesk', Inter, system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(4rem, 13vw, 13rem);
  line-height: 1;
  letter-spacing: -0.045em;
  color: rgba(0, 229, 133, 0.06);
  -webkit-text-stroke: 1.5px rgba(0, 229, 133, 0.45);
}
`}</style>

      {/* Soft ambient glow at top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[640px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E585]/[0.03] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-12 lg:gap-20">
          {/* Brand Column */}
          <div className="max-w-sm">
            <Link to="/" aria-label="VyomAcre home">
              <span className="text-2xl font-bold tracking-tight text-[#F4F8F5]" style={{ fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif" }}>
                Vyom<span className="text-[#00E585]">Acre</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-[#7E8B82]">
              AI-Powered Space Discovery — turning empty rooftops into revenue.
            </p>

            {/* Status Indicator */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#0A1410]/60 px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E585] opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E585]" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7E8B82]">
                Platform Online
              </span>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1C2A22] bg-[#0A1410]/60 text-[#93A096] transition-all duration-300 hover:-translate-y-1 hover:border-[#00E585]/50 hover:text-[#00E585] hover:shadow-[0_0_20px_rgba(0,229,133,0.25)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-[#5E6B62]">PLATFORM</h3>
            <ul className="mt-6 space-y-3.5">
              {platformLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="group inline-flex items-center">
                    <span className="text-sm font-medium text-[#93A096] transition-colors duration-200 group-hover:text-[#00E585]">
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="ml-1.5 h-px w-0 bg-[#00E585]/60 transition-all duration-300 group-hover:w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-[#5E6B62]">COMPANY</h3>
            <ul className="mt-6 space-y-3.5">
              {companyLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="group inline-flex items-center">
                    <span className="text-sm font-medium text-[#93A096] transition-colors duration-200 group-hover:text-[#00E585]">
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="ml-1.5 h-px w-0 bg-[#00E585]/60 transition-all duration-300 group-hover:w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-[#121D17] lg:my-14" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span className="text-[#5E6B62]">© 2026 VyomAcre. All rights reserved.</span>
            <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[#24352B] sm:block" />
            <span className="text-[#5E6B62]">
              Built by <span className="text-[#93A096]">Team Devdoots</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#5E6B62]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">VYOM // SYSTEM</span>
            <span className="h-1 w-1 rounded-full bg-[#00E585]/60 shadow-[0_0_6px_rgba(0,229,133,0.5)]" />
            <span className="text-[10px] uppercase tracking-[0.14em]">Active</span>
          </div>
        </div>
      </div>

      {/* ===== Green fire wordmark ===== */}
      <div className="relative">
        {/* The fire — ignites when scrolled into view */}
        <motion.div
          initial={{ opacity: 0, scale: 0.55 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
          aria-hidden="true"
        >
          <div className="relative h-[260px] w-[760px] max-w-[120vw]">
            {/* flame layers — wide, mid, core */}
            <div
              className="absolute inset-x-[18%] bottom-0 h-[140px] blur-[90px]"
              style={{
                background: 'radial-gradient(ellipse at bottom, rgba(0,229,133,0.30), transparent 70%)',
                transformOrigin: 'bottom',
                animation: 'vyflicker 3.6s ease-in-out infinite',
              }}
            />
            <div
              className="absolute inset-x-[30%] bottom-0 h-[200px] blur-[80px]"
              style={{
                background: 'radial-gradient(ellipse at bottom, rgba(0,229,133,0.38), transparent 70%)',
                transformOrigin: 'bottom',
                animation: 'vyflicker 2.7s ease-in-out infinite',
                animationDelay: '0.4s',
              }}
            />
            <div
              className="absolute inset-x-[40%] bottom-0 h-[235px] blur-[55px]"
              style={{
                background: 'radial-gradient(ellipse at bottom, rgba(0,229,133,0.5), transparent 72%)',
                transformOrigin: 'bottom',
                animation: 'vyflicker 2.1s ease-in-out infinite',
                animationDelay: '0.9s',
              }}
            />

            {/* rising embers */}
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: (10 + ((i * 67) % 80)) + '%',
                  bottom: ((i % 3) * 12) + 'px',
                  width: (2.5 + (i % 3)) + 'px',
                  height: (2.5 + (i % 3)) + 'px',
                  background: '#00E585',
                  boxShadow: '0 0 10px 2px rgba(0,229,133,0.55)',
                  animation: 'vyember ' + (2.4 + (i % 4) * 0.65).toFixed(2) + 's linear infinite',
                  animationDelay: (i * 0.42).toFixed(2) + 's',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* The wordmark — fully visible, no clipping */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative z-10 flex select-none justify-center pb-8 pt-6"
        >
          <span className="vy-firemark">VyomAcre</span>
        </motion.div>
      </div>
    </footer>
  );
}
