import React from 'react';
import {
    ArrowRight,
    CheckCircle2,
    Home,
    Leaf,
    LockKeyhole,
    Search,
    ShieldCheck,
    Sun,
    TrendingUp,
    Zap
} from 'lucide-react';

export default function LandingPage() {
    return (
        <section className="relative overflow-hidden bg-slate-950 text-white">

            {/* Background Glow */}
            <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 p-2 shadow-lg shadow-sky-500/20">
                            <Home size={25} />
                        </div>

                        <span className="text-2xl font-extrabold tracking-tight">
                            Vyom<span className="text-sky-400">Acre</span>
                        </span>
                    </div>

                    <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
                        <a href="#" className="text-sky-400">Home</a>
                        <a href="#benefits" className="transition hover:text-white">Features</a>
                        <a href="#owner-form" className="transition hover:text-white">List Roof</a>
                        <a href="#owner-status" className="transition hover:text-white">Status</a>
                    </div>

                    <a
                        href="#owner-form"
                        className="hidden rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 px-5 py-2.5 font-bold text-white shadow-lg shadow-sky-500/20 transition hover:scale-105 md:block"
                    >
                        Get Started
                    </a>
                </div>
            </nav>

            {/* HERO */}
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">

                {/* LEFT */}
                <div>

                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300 backdrop-blur">
                        <Zap size={16} />
                        Clean Energy
                        <span className="text-slate-500">•</span>
                        Better Tomorrow
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                        Turn Your Roof Into
                        <span className="block bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                            An Opportunity
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                        VyomAcre helps homeowners and businesses unlock the value of
                        unused rooftops. List your roof, get verified, and connect with
                        trusted solar and commercial partners.
                    </p>

                    {/* Buttons */}
                    <div className="mt-8 flex flex-wrap gap-4">

                        <a
                            href="#owner-form"
                            className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-4 font-bold shadow-xl shadow-sky-500/20 transition hover:scale-105"
                        >
                            <Home size={20} />
                            List Your Roof
                            <ArrowRight
                                size={20}
                                className="transition group-hover:translate-x-1"
                            />
                        </a>

                        <a
                            href="#owner-status"
                            className="flex items-center gap-3 rounded-xl border border-slate-600 bg-white/5 px-6 py-4 font-bold backdrop-blur transition hover:border-sky-400 hover:bg-white/10"
                        >
                            <Search size={20} />
                            Check Status
                        </a>

                    </div>

                    {/* Trust Features */}
                    <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                            <ShieldCheck className="text-sky-400" size={24} />
                            <p className="mt-2 text-xs font-semibold text-slate-300">
                                Verified Partners
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                            <LockKeyhole className="text-emerald-400" size={24} />
                            <p className="mt-2 text-xs font-semibold text-slate-300">
                                Safe Process
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                            <TrendingUp className="text-violet-400" size={24} />
                            <p className="mt-2 text-xs font-semibold text-slate-300">
                                Better Returns
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                            <Leaf className="text-emerald-400" size={24} />
                            <p className="mt-2 text-xs font-semibold text-slate-300">
                                Sustainable
                            </p>
                        </div>

                    </div>
                </div>

                {/* RIGHT — FUTURISTIC ROOFTOP VISUAL */}
                <div className="relative mx-auto w-full max-w-xl">

                    {/* Glow */}
                    <div className="absolute inset-10 rounded-full bg-sky-500/20 blur-3xl" />

                    {/* Solar Potential Card */}
                    <div className="absolute left-0 top-8 z-20 rounded-2xl border border-sky-400/40 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-sky-400" />
                            <span className="text-xs text-slate-300">
                                Solar Potential
                            </span>
                        </div>

                        <p className="mt-2 text-2xl font-extrabold text-white">
                            98%
                        </p>

                        <div className="mt-2 flex items-end gap-1">
                            <span className="h-3 w-2 rounded-sm bg-sky-500" />
                            <span className="h-5 w-2 rounded-sm bg-sky-400" />
                            <span className="h-7 w-2 rounded-sm bg-emerald-400" />
                            <span className="h-9 w-2 rounded-sm bg-emerald-300" />
                            <span className="h-11 w-2 rounded-sm bg-sky-300" />
                        </div>
                    </div>

                    {/* Main House */}
                    <div className="relative mx-auto mt-16 h-[430px] w-[390px] overflow-hidden rounded-[3rem] border border-sky-400/30 bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl shadow-sky-500/20">

                        {/* Sky */}
                        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/80 via-slate-900 to-slate-950" />

                        {/* Sun */}
                        <div className="absolute right-12 top-8 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 shadow-[0_0_60px_rgba(250,204,21,0.25)]">
                            <Sun size={42} className="text-yellow-300" />
                        </div>

                        {/* House */}
                        <div className="absolute bottom-16 left-10 right-10">

                            {/* Roof */}
                            <div className="relative mx-auto h-32 w-72 -skew-x-6 rounded-t-[4rem] border border-sky-300/40 bg-gradient-to-br from-slate-700 to-slate-900 shadow-[0_0_40px_rgba(14,165,233,0.2)]">

                                {/* Solar Panels */}
                                <div className="absolute left-8 top-8 grid grid-cols-4 gap-1 rounded-lg border border-sky-400/40 bg-sky-950/80 p-2">

                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((panel) => (
                                        <div
                                            key={panel}
                                            className="h-7 w-9 rounded-sm border border-sky-400/40 bg-gradient-to-br from-sky-700 to-blue-950"
                                        />
                                    ))}

                                </div>
                            </div>

                            {/* Building */}
                            <div className="mx-auto h-32 w-64 rounded-b-xl border-x border-b border-white/10 bg-gradient-to-br from-slate-700 to-slate-900">

                                <div className="grid grid-cols-3 gap-3 px-6 pt-6">
                                    <div className="h-12 rounded border border-yellow-300/30 bg-yellow-200/20 shadow-[0_0_15px_rgba(250,204,21,0.15)]" />
                                    <div className="h-12 rounded border border-yellow-300/30 bg-yellow-200/20 shadow-[0_0_15px_rgba(250,204,21,0.15)]" />
                                    <div className="h-12 rounded border border-yellow-300/30 bg-yellow-200/20 shadow-[0_0_15px_rgba(250,204,21,0.15)]" />
                                </div>

                            </div>
                        </div>

                        {/* Energy Rings */}
                        <div className="absolute bottom-8 left-1/2 h-12 w-80 -translate-x-1/2 rounded-[50%] border border-sky-400/60 shadow-[0_0_30px_rgba(14,165,233,0.35)]" />

                        <div className="absolute bottom-4 left-1/2 h-8 w-64 -translate-x-1/2 rounded-[50%] border border-emerald-400/40" />

                    </div>

                    {/* Benefits Card */}
                    <div className="absolute bottom-12 right-0 z-20 rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-sky-500/20 p-2">
                                    <Zap size={18} className="text-sky-400" />
                                </div>
                                <span className="text-sm font-semibold">
                                    More Energy
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-violet-500/20 p-2">
                                    <TrendingUp size={18} className="text-violet-400" />
                                </div>
                                <span className="text-sm font-semibold">
                                    More Income
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-emerald-500/20 p-2">
                                    <Leaf size={18} className="text-emerald-400" />
                                </div>
                                <span className="text-sm font-semibold">
                                    Greener Planet
                                </span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* STATS */}
            <div className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-8">

                <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">

                    <div className="border-b border-white/10 p-7 text-center lg:border-b-0 lg:border-r">
                        <p className="text-3xl font-black text-sky-400">10K+</p>
                        <p className="mt-2 text-sm text-slate-400">Rooftops Listed</p>
                    </div>

                    <div className="border-b border-white/10 p-7 text-center lg:border-b-0 lg:border-r">
                        <p className="text-3xl font-black text-emerald-400">5K+</p>
                        <p className="mt-2 text-sm text-slate-400">Active Partners</p>
                    </div>

                    <div className="border-b border-white/10 p-7 text-center sm:border-b-0 lg:border-r">
                        <p className="text-3xl font-black text-emerald-300">2.5M+</p>
                        <p className="mt-2 text-sm text-slate-400">CO₂ Reduction</p>
                    </div>

                    <div className="p-7 text-center">
                        <p className="text-3xl font-black text-sky-300">₹500Cr+</p>
                        <p className="mt-2 text-sm text-slate-400">Value Unlocked</p>
                    </div>

                </div>

            </div>

            {/* BENEFITS */}
            <div
                id="benefits"
                className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8"
            >
                <h2 className="text-3xl font-extrabold">
                    Why Choose VyomAcre?
                </h2>

                <div className="mt-8 grid gap-6 md:grid-cols-3">

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <Home className="text-sky-400" size={32} />
                        <h3 className="mt-5 text-xl font-bold">
                            Easy Roof Listing
                        </h3>
                        <p className="mt-3 text-slate-400">
                            Submit your rooftop information through a simple owner form.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <CheckCircle2 className="text-emerald-400" size={32} />
                        <h3 className="mt-5 text-xl font-bold">
                            Smart Verification
                        </h3>
                        <p className="mt-3 text-slate-400">
                            Your submitted roof can move through the verification process.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <TrendingUp className="text-violet-400" size={32} />
                        <h3 className="mt-5 text-xl font-bold">
                            Track Your Status
                        </h3>
                        <p className="mt-3 text-slate-400">
                            Quickly check the current verification status of your roof.
                        </p>
                    </div>

                </div>
            </div>

        </section>
    );
}