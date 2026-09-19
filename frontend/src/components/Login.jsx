import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Satellite, ArrowRight } from 'lucide-react';
import { loginUser } from '../services/api';

/* ============================================================
   VyomAcre — Login (split-screen, brand panel + form)
   - Password show/hide toggle
   - Role-based redirect: owner / seeker / admin
   ============================================================ */

/* ---------- brand panel (animated orbits) ---------- */
function BrandPanel({ title, subtitle, lines }) {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:border-r lg:border-[#182420] lg:p-12 xl:p-16">
      <style>{`
@keyframes vyo-spin { to { transform: rotate(360deg); } }
@keyframes vyo-spin-rev { to { transform: rotate(-360deg); } }
@keyframes vyo-floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
`}</style>

      {/* orbit system */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-[340px] w-[340px] items-center justify-center rounded-full border border-[#1C2A22]/60" style={{ animation: 'vyo-spin 26s linear infinite' }}>
          <div className="absolute h-3.5 w-3.5 rounded-full bg-[#00E585] shadow-[0_0_16px_rgba(0,229,133,0.8)]" style={{ top: '-7px', left: '50%', marginLeft: '-7px' }} />
          <div className="flex h-[230px] w-[230px] items-center justify-center rounded-full border border-[#1C2A22]/80" style={{ animation: 'vyo-spin-rev 18s linear infinite' }}>
            <div className="absolute h-2.5 w-2.5 rounded-full bg-[#00E585]/80 shadow-[0_0_12px_rgba(0,229,133,0.7)]" style={{ top: '-5px', left: '50%', marginLeft: '-5px' }} />
            <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full border border-[#00E585]/25" style={{ animation: 'vyo-spin 12s linear infinite' }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00E585]/30 bg-[#071009]" style={{ animation: 'vyo-floaty 4s ease-in-out infinite' }}>
                <Satellite size={24} className="text-[#00E585]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Link to="/" className="vy-head text-lg font-semibold tracking-tight">
          Vyom<span className="text-[#00E585]">Acre</span>
        </Link>
      </div>

      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="vy-head max-w-sm text-4xl font-semibold leading-[1.05] tracking-[-0.02em] xl:text-5xl"
        >
          {title}
        </motion.h2>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[#93A096]">{subtitle}</p>
        <ul className="mt-8 space-y-3">
          {lines.map((l, i) => (
            <motion.li
              key={l}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.12 }}
              className="flex items-center gap-3 text-sm text-[#C9D6CC]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E585] shadow-[0_0_8px_rgba(0,229,133,0.7)]" />
              {l}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- shared field ---------- */
const FIELD =
  'w-full rounded-xl border border-[#1C2A22] bg-[#0A1410] px-4 py-3 text-sm text-[#F4F8F5] outline-none transition-all duration-300 placeholder:text-[#5E6B62] focus:border-[#00E585]/50 focus:shadow-[0_0_0_3px_rgba(0,229,133,0.08)]';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);

      const user = response?.data?.user || response?.user;

      if (user?.role === 'owner') {
        navigate('/owner-dashboard');
      } else if (user?.role === 'seeker') {
        navigate('/seeker-dashboard');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/seeker-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);

      const message = err?.response?.data?.message || 'Incorrect email or password';

      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen bg-[#050A08] text-[#E7EFE9]"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
`}</style>

      <BrandPanel
        title="Welcome back to the rooftop economy."
        subtitle="Log in to manage your listings, track verifications and discover opportunities."
        lines={[
          'Satellite-verified rooftop listings',
          'AI assistant in Hindi and English',
          'Lease requests, inbox and agreements',
        ]}
      />

      {/* form side */}
      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E585]/[0.04] blur-[130px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#071009]/80 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00E585]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#93A096]">
                Platform Online
              </span>
            </div>

            <h1 className="vy-head mt-5 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Log in
            </h1>
            <p className="mt-2 text-sm text-[#93A096]">
              Enter your details to access your dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1C2A22] bg-[#071009]/70 p-6 backdrop-blur sm:p-8">

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
                  Phone Number / Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone"
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={FIELD + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#93A096] transition-colors hover:bg-[#0F1A14] hover:text-[#00E585]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00E585] px-4 py-3 text-sm font-semibold text-[#04160C] shadow-[0_0_22px_rgba(0,229,133,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(0,229,133,0.38)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#04160C]/30 border-t-[#04160C]" />
                    Logging in…
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-[#93A096]">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#00E585] transition-colors hover:text-[#4FFFAB]">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
