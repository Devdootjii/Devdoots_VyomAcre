import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Properties', path: '/properties' },
  { label: 'About', path: '/about' },
  { label: 'Help', path: '/help' },
];

const desktopNavTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
};

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -8,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -8,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const mobileItemVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  const handleLogoClick = (event) => {
    event.preventDefault();

    if (isHomePage) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      navigate('/');
    }

    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 top-0 z-[100] w-full"
    >
      <div className="border-b border-white/10 bg-[#020706]/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            onClick={handleLogoClick}
            aria-label="VyomAcre home"
            className="group relative inline-flex items-center rounded-full py-2 pr-3 outline-none"
          >
            <motion.div
              whileHover={{ y: -1 }}
              transition={desktopNavTransition}
              className="relative flex items-center"
            >
              <span className="text-[1.35rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.45rem]">
                Vyom
              </span>

              <span className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[#00FF87] sm:text-[1.45rem]">
                Acre
              </span>

              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute -inset-x-2 -inset-y-1 -z-10 rounded-full bg-[#00FF87]/10 blur-md"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.025] p-1 backdrop-blur-md">
              {navItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] text-slate-300 outline-none transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/40"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-pill"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                        className="absolute inset-0 -z-0 rounded-full border border-white/10 bg-white/[0.055]"
                      />
                    )}

                    <span
                      className={`relative z-10 ${
                        isActive
                          ? 'text-white [text-shadow:0_0_10px_rgba(0,255,135,0.12)]'
                          : ''
                      }`}
                    >
                      {item.label}
                    </span>

                    <span className="pointer-events-none absolute inset-x-3 -bottom-[1px] h-px scale-x-0 bg-[#00FF87]/60 opacity-0 blur-[1px] transition-all duration-300 group-hover:scale-x-100" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2.5 text-[13px] font-medium text-slate-300 outline-none transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
            >
              Log In
            </Link>

            <motion.div
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.975 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 22,
              }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#00FF87] px-5 py-2.5 text-[13px] font-semibold tracking-[-0.01em] text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] outline-none transition-shadow duration-300 hover:shadow-[0_0_22px_rgba(0,255,135,0.42)] focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706]"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/30 md:hidden"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            </span>

            <span className="relative flex h-4 w-4 flex-col items-center justify-center">
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: 45, y: 0 }
                    : { rotate: 0, y: -3 }
                }
                transition={{ duration: 0.2 }}
                className="absolute h-px w-4 bg-current"
              />

              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, y: 0 }
                    : { rotate: 0, y: 3 }
                }
                transition={{ duration: 0.2 }}
                className="absolute h-px w-4 bg-current"
              />
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              key="mobile-navigation"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden border-t border-white/10 bg-[#030A08]"
            >
              <div className="mx-auto max-w-7xl px-5 pb-5 pt-3 sm:px-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-2">
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const isActive =
                        item.path === '/'
                          ? location.pathname === '/'
                          : location.pathname === item.path ||
                            location.pathname.startsWith(`${item.path}/`);

                      return (
                        <motion.div
                          key={item.path}
                          variants={mobileItemVariants}
                        >
                          <Link
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#00FF87]/30 ${
                              isActive
                                ? 'border border-white/10 bg-white/[0.05] text-white'
                                : 'text-slate-300 hover:bg-white/[0.03] hover:text-white'
                            }`}
                          >
                            <span>{item.label}</span>

                            <span
                              className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.65)]'
                                  : 'bg-white/10'
                              }`}
                            />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    variants={mobileItemVariants}
                    className="mt-3 border-t border-white/10 pt-3"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-medium text-slate-300 outline-none transition-colors duration-200 hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
                      >
                        Log In
                      </Link>

                      <Link
                        to="/signup"
                        onClick={closeMobileMenu}
                        className="inline-flex items-center justify-center rounded-full bg-[#00FF87] px-4 py-3 text-sm font-semibold text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.22)] outline-none transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,135,0.36)] focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030A08]"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}