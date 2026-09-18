import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
      console.error('Failed to parse vyomacre_user from localStorage:', error);
      user = null;
    }

    setAuthState({
      isLoggedIn: Boolean(token),
      user,
    });
  }, [location.pathname]);

  const isLoggedIn = authState.isLoggedIn;
  const user = authState.user;

  const firstName =
    user?.name && typeof user.name === 'string'
      ? user.name.trim().split(' ')[0]
      : 'User';

  const isHomePage = location.pathname === '/';

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
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-white"
          onClick={() => setIsOpen(false)}
        >
          Vyom<span className="text-cyan-400">Acre</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={
                  'text-sm font-medium transition ' +
                  (active
                    ? 'text-cyan-400'
                    : 'text-slate-300 hover:text-white')
                }
              >
                {link.name}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300">
                Hi, {firstName}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-500 hover:text-red-400"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <User size={16} />
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-200 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-800 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={
                    'rounded-lg px-3 py-2 text-sm font-medium ' +
                    (active
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white')
                  }
                >
                  {link.name}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-slate-300">
                  Hi, {firstName}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-cyan-400 hover:bg-slate-800"
              >
                <User size={16} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;