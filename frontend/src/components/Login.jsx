import React, { useState } from 'react';
import { loginUser } from '../services/api';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage('');
        setError('');

        try {
            await loginUser(formData);

            setMessage('Login successful!');
            console.log('Login successful. Token saved automatically.');
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

    return (
        <section className="min-h-screen bg-slate-950 px-6 py-20 text-white">
            <div className="mx-auto max-w-md">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">

                    <div className="mb-8 text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-400">
                            VyomAcre
                        </p>

                        <h1 className="mt-3 text-4xl font-black">
                            Owner Login
                        </h1>

                        <p className="mt-3 text-slate-400">
                            Login to manage your rooftop listings.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ramesh@example.com"
                                required
                                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                    </form>
                </div>
            </div>
        </section>
    );
}