import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../services/api';

function AmbientGlow({ className = '' }) {
    return (
        <div
            aria-hidden="true"
            className={
                'pointer-events-none absolute rounded-full bg-[#00FF87]/[0.055] blur-[130px] ' +
                className
            }
        />
    );
}

function GoogleIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
        >
            <path
                d="M21.805 12.23c0-.72-.065-1.41-.185-2.07H12v3.92h5.49a4.69 4.69 0 0 1-2.04 3.08v2.57h3.3c1.93-1.78 3.055-4.4 3.055-7.5Z"
                fill="#4285F4"
            />
            <path
                d="M12 22c2.76 0 5.07-.915 6.755-2.48l-3.3-2.57c-.915.615-2.085.98-3.455.98-2.66 0-4.91-1.795-5.72-4.205H2.87v2.65A10.205 10.205 0 0 0 12 22Z"
                fill="#34A853"
            />
            <path
                d="M6.28 13.725A6.13 6.13 0 0 1 5.96 12c0-.6.11-1.185.32-1.725v-2.65H2.87A10.03 10.03 0 0 0 1.8 12c0 1.615.385 3.14 1.07 4.375l3.41-2.65Z"
                fill="#FBBC05"
            />
            <path
                d="M12 6.07c1.5 0 2.845.515 3.905 1.525l2.925-2.925C17.065 3.03 14.755 2 12 2A10.205 10.205 0 0 0 2.87 7.625l3.41 2.65C7.09 7.865 9.34 6.07 12 6.07Z"
                fill="#EA4335"
            />
        </svg>
    );
}

function Field({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500"
            >
                {label}
            </label>

            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={
                    type === 'password' ? 'current-password' : 'email'
                }
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none placeholder:text-slate-700 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.045)]"
            />
        </div>
    );
}

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await loginUser({
                email,
                password,
            });

            console.log('Login successful:', response);

            setMessage('Login successful!');

            /*
             * Login API already saves:
             * - vyomacre_token
             * - vyomacre_owner_data
             *
             * Redirect owner to dashboard after successful login.
             */
            setTimeout(() => {
                navigate('/owner-dashboard');
            }, 500);
        } catch (err) {
            console.error('Login failed:', err);

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Login failed. Please check your email and password.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setError(
            'Google login is not connected yet. Please use email and password.'
        );
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020706] px-5 py-24 font-sans text-white selection:bg-[#00FF87]/20 selection:text-white sm:px-6">

            {/* Background Glow */}
            <AmbientGlow className="left-1/2 top-[-10%] h-[520px] w-[720px] -translate-x-1/2" />

            <AmbientGlow className="bottom-[-10%] left-[-8%] h-[320px] w-[320px]" />

            <AmbientGlow className="right-[-8%] top-[40%] h-[260px] w-[260px]" />

            {/* Background Grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
                    backgroundSize: '72px 72px',
                }}
            />

            {/* Login Card */}
            <motion.section
                initial={{
                    opacity: 0,
                    y: 28,
                    scale: 0.985,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                transition={{
                    duration: 0.75,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">

                    {/* Card Glow */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-[#00FF87]/[0.035] blur-[70px]"
                    />

                    <div className="relative">

                        {/* Logo */}
                        <div className="flex justify-center">
                            <Link
                                to="/"
                                aria-label="VyomAcre home"
                                className="group inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/40"
                            >
                                <motion.span
                                    whileHover={{ y: -1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 24,
                                    }}
                                    className="text-2xl font-semibold tracking-[-0.045em]"
                                >
                                    <span className="text-white">Vyom</span>
                                    <span className="text-[#00FF87]">Acre</span>
                                </motion.span>
                            </Link>
                        </div>

                        {/* Heading */}
                        <div className="mt-8 text-center">

                            <div className="mx-auto mb-4 flex items-center justify-center gap-2">
                                <span className="h-px w-8 bg-[#00FF87]/25" />

                                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-600">
                                    SECURE ACCESS
                                </span>

                                <span className="h-px w-8 bg-[#00FF87]/25" />
                            </div>

                            <h1 className="text-3xl font-medium tracking-[-0.05em] text-white sm:text-[2.15rem]">
                                Welcome Back
                            </h1>

                            <p className="mt-3 text-sm text-slate-500">
                                Sign in to manage your spaces
                            </p>
                        </div>

                        {/* Login Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8"
                        >
                            <div className="space-y-5">

                                {/* Email */}
                                <Field
                                    id="email"
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@company.com"
                                />

                                {/* Password */}
                                <div>

                                    <div className="mb-2 flex items-center justify-between gap-3">

                                        <label
                                            htmlFor="password"
                                            className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500"
                                        >
                                            Password
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setError(
                                                    'Password reset is not connected yet.'
                                                )
                                            }
                                            className="text-[10px] font-medium text-slate-600 transition-colors duration-200 hover:text-[#00FF87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
                                        >
                                            Forgot password?
                                        </button>

                                    </div>

                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="h-12 w-full rounded-xl border border-white/10 bg-[#030A08] px-4 text-sm text-white outline-none placeholder:text-slate-700 transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10 focus:shadow-[0_0_20px_rgba(0,255,135,0.045)]"
                                    />

                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Success */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
                                >
                                    {message}
                                </motion.div>
                            )}

                            {/* Login Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{
                                    scale: loading ? 1 : 1.015,
                                }}
                                whileTap={{
                                    scale: loading ? 1 : 0.985,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 24,
                                }}
                                className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-[#00FF87] text-sm font-semibold text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] outline-none transition-all duration-300 hover:shadow-[0_0_26px_rgba(0,255,135,0.42)] focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? 'Logging in...' : 'Login'}

                                {!loading && (
                                    <span className="ml-2 text-base leading-none">
                                        ✦
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="my-7 flex items-center gap-3">

                            <span className="h-px flex-1 bg-white/10" />

                            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-700">
                                or
                            </span>

                            <span className="h-px flex-1 bg-white/10" />

                        </div>

                        {/* Google */}
                        <motion.button
                            type="button"
                            onClick={handleGoogleLogin}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{
                                type: 'spring',
                                stiffness: 360,
                                damping: 25,
                            }}
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.025] text-sm font-medium text-slate-300 outline-none backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#00FF87]/25"
                        >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                                <GoogleIcon />
                            </span>

                            Continue with Google
                        </motion.button>

                        {/* Protected Access */}
                        <div className="mt-7 flex items-center justify-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87]/70 shadow-[0_0_7px_rgba(0,255,135,0.65)]" />

                            <span className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                                Protected access
                            </span>

                        </div>

                    </div>
                </div>

                {/* Register Link */}
                <p className="mt-6 text-center text-xs text-slate-600">
                    New to VyomAcre?{' '}

                    <Link
                        to="/register"
                        className="font-medium text-slate-400 transition-colors duration-200 hover:text-[#00FF87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87]/30"
                    >
                        Create account
                    </Link>
                </p>

            </motion.section>
        </main>
    );
} 