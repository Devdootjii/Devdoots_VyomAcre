import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';

/* ============================================================
   VyomAcre — Navbar (glass edition)
   - Top of page: transparent, blends into the page
   - On scroll: shrinks into a floating rounded glass bar
     (frosted blur — content glides past behind it)
   - Green/black theme to match the landing page
   ============================================================ */

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('vyomacre_token');
    let user = null;

    try {
      const savedUser = localStorage.getItem('vyomacre_user');

      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Failed to parse vyomacre_user from localStorage:', error);
      user = null;
    }

    return {
      isLoggedIn: Boolean(token),
      user,
    };
  });

  useEffect(() => {
    const token = localStorage.getItem('vyomacre_token');
    let user = null;

    try {
      const savedUser = localStorage.getItem('vyomacre_user');

      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (error) {
      user = null;
    }

    setAuthState({
      isLoggedIn: Boolean(token),
      user,
    });
  }, [location.pathname]);

  // Glass pill appears once the page starts scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLoggedIn = authState.isLoggedIn;
  const user = authState.user;

  const firstName =
    user?.name && typeof user.name === 'string'
      ? user.name.trim().split(' ')[0]
      : 'User';

  const handleLogout = () => {
    localStorage.removeItem('vyomacre_token');
    localStorage.removeItem('vyomacre_user');
    localStorage.removeItem('vyomacre_owner');

    setAuthState({
      isLoggedIn: false,
      user: null,
    });

    setIsOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
  ];
  if (isLoggedIn && user?.role === 'owner') {
    navLinks.push(
      { name: 'Owner Dashboard', path: '/owner-dashboard' },
      { name: 'Owner Inbox', path: '/owner-inbox' }
    );
  }
  if (isLoggedIn && user?.role === 'seeker') {
    navLinks.push({
      name: 'Seeker Dashboard',
      path: '/seeker-dashboard',
    });
  }

  return (
    <nav className="sticky top-0 z-50">
      {/* Wrapper — gains side padding when scrolled so the pill floats */}
      <div className={'transition-all duration-500 ' + (scrolled ? 'px-4 pt-4 sm:px-5' : 'px-0 pt-0')}>
        {/* The bar itself — solid theme color at top, liquid glass pill when scrolled */}
        <div
          className={
            'mx-auto max-w-7xl transition-all duration-500 ' +
            (scrolled
              ? 'rounded-[22px] border border-[#1C2A22]/80 bg-[#0A1410]/50 shadow-[0_14px_44px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150'
              : 'rounded-none border border-transparent bg-[#050A08]')
          }
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-[#F4F8F5]"
              style={{ fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif" }}
              onClick={() => setIsOpen(false)}
            >
              Vyom<span className="text-[#00E585]">Acre</span>
            </Link>

            {/* Desktop */}
            <div className="hidden items-center gap-1.5 md:flex">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ' +
                      (active
                        ? 'bg-[#00E585]/10 text-[#00E585]'
                        : 'text-[#93A096] hover:text-[#F4F8F5]')
                    }
                  >
                    {link.name}
                  </Link>
                );
              })}

              {isLoggedIn ? (
                <div className="ml-3 flex items-center gap-3 border-l border-[#1C2A22] pl-4">
                  <span className="text-sm font-medium text-[#93A096]">
                    Hi, {firstName}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl border border-[#24352B] px-3.5 py-2 text-sm font-medium text-[#D7E2DA] transition-colors hover:border-red-500/50 hover:text-red-400"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="ml-3 flex items-center gap-2.5 border-l border-[#1C2A22] pl-4">
                  <Link
                    to="/login"
                    className="rounded-xl border border-[#24352B] px-4 py-2 text-sm font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50 hover:text-[#00E585]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 rounded-xl bg-[#00E585] px-4 py-2 text-sm font-semibold text-[#04160C] transition hover:brightness-110"
                  >
                    <User size={15} />
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="rounded-lg p-2 text-[#D7E2DA] md:hidden"
              onClick={() => setIsOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu — inside the glass pill */}
          {isOpen && (
            <div className="border-t border-[#1C2A22] px-5 py-4 md:hidden">
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  const active = location.pathname === link.path;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={
                        'rounded-xl px-3 py-2.5 text-sm font-medium ' +
                        (active
                          ? 'bg-[#00E585]/10 text-[#00E585]'
                          : 'text-[#93A096] hover:bg-[#0F1A14] hover:text-[#F4F8F5]')
                      }
                    >
                      {link.name}
                    </Link>
                  );
                })}

                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-[#93A096]">
                      Hi, {firstName}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-[#0F1A14]"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-[#24352B] px-3 py-2.5 text-center text-sm font-medium text-[#D7E2DA]"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#00E585] px-3 py-2.5 text-sm font-semibold text-[#04160C]"
                    >
                      <User size={16} />
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
