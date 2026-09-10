import React from 'react';

export default function LandingPage() {
    return (
        <section className="relative overflow-hidden bg-slate-950 text-white">

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950 opacity-90" />

            <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">

                {/* Hero */}
                <div className="max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
                        VyomAcre Platform
                    </p>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                        Turn Your Roof Into
                        <span className="block text-sky-400">
                            An Opportunity
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                        List your rooftop, submit your roof details, and track the
                        verification process from one simple platform.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <a
                            href="#owner-form"
                            className="rounded-xl bg-sky-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-sky-400"
                        >
                            List Your Roof
                        </a>

                        <a
                            href="#owner-status"
                            className="rounded-xl border border-slate-600 px-6 py-3 font-bold text-slate-200 transition hover:bg-white/10"
                        >
                            Check Status
                        </a>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold">
                        Why Choose VyomAcre?
                    </h2>

                    <div className="mt-8 grid gap-6 md:grid-cols-3">

                        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                            <div className="mb-4 text-3xl">🏠</div>
                            <h3 className="text-xl font-bold">
                                Easy Roof Listing
                            </h3>
                            <p className="mt-3 text-slate-300">
                                Submit your rooftop information through a simple owner form.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                            <div className="mb-4 text-3xl">🔍</div>
                            <h3 className="text-xl font-bold">
                                Smart Verification
                            </h3>
                            <p className="mt-3 text-slate-300">
                                Your submitted roof can move through the verification process.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                            <div className="mb-4 text-3xl">📊</div>
                            <h3 className="text-xl font-bold">
                                Track Your Status
                            </h3>
                            <p className="mt-3 text-slate-300">
                                Quickly check the current verification status of your roof.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Platform Stats */}
                <div className="mt-16 grid gap-5 sm:grid-cols-3">

                    <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-6 text-center">
                        <p className="text-4xl font-extrabold text-sky-400">
                            24/7
                        </p>
                        <p className="mt-2 text-slate-300">
                            Platform Access
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
                        <p className="text-4xl font-extrabold text-emerald-400">
                            Smart
                        </p>
                        <p className="mt-2 text-slate-300">
                            Roof Verification
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-center">
                        <p className="text-4xl font-extrabold text-amber-400">
                            Simple
                        </p>
                        <p className="mt-2 text-slate-300">
                            Owner Experience
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}