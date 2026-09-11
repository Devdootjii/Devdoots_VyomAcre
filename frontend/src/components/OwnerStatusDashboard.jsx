import React from 'react';

export default function OwnerStatusDashboard() {
    return (
        <section
            id="owner-status"
            className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white lg:px-8"
        >

            {/* Background Glow */}
            <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-400">
                        Owner Dashboard
                    </p>

                    <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
                        Roof Verification Status
                    </h2>

                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                        Check the current verification status of your submitted roof.
                    </p>
                </div>

                {/* Owner Information Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                    <div className="grid gap-8 md:grid-cols-3">

                        {/* Owner Name */}
                        <div className="border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0">
                            <p className="text-sm font-medium text-slate-500">
                                Owner Name
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                Atul
                            </p>
                        </div>

                        {/* Roof Area */}
                        <div className="border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pl-8">
                            <p className="text-sm font-medium text-slate-500">
                                Roof Area
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                500 sq ft
                            </p>
                        </div>

                        {/* Verification Status */}
                        <div className="md:pl-8">
                            <p className="text-sm font-medium text-slate-500">
                                Verification Status
                            </p>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-2xl font-bold text-amber-400">
                                    Pending
                                </span>

                                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                    Under Review
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Verification Progress */}
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                    {/* Progress Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>
                            <p className="text-2xl font-bold">
                                Verification Progress
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Your roof verification is currently in progress.
                            </p>
                        </div>

                        <p className="text-4xl font-black text-sky-400">
                            50%
                        </p>

                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shadow-lg shadow-sky-500/20"
                            style={{ width: '50%' }}
                        />
                    </div>

                    {/* Verification Steps */}
                    <div className="mt-12 grid gap-8 md:grid-cols-3">

                        {/* Submitted */}
                        <div className="relative">

                            <div className="mb-5 h-1 rounded-full bg-emerald-400" />

                            <p className="text-lg font-bold text-emerald-400">
                                Submitted
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Roof details submitted successfully.
                            </p>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                Completed
                            </p>

                        </div>

                        {/* Verification */}
                        <div className="relative">

                            <div className="mb-5 h-1 rounded-full bg-sky-400" />

                            <p className="text-lg font-bold text-sky-400">
                                Verification
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Your roof is currently being reviewed.
                            </p>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-sky-400">
                                In Progress
                            </p>

                        </div>

                        {/* Approved */}
                        <div className="relative">

                            <div className="mb-5 h-1 rounded-full bg-slate-700" />

                            <p className="text-lg font-bold text-slate-500">
                                Approved
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Approval will appear here after verification.
                            </p>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Waiting
                            </p>

                        </div>

                    </div>
                </div>

                {/* Bottom Information */}
                <div className="mt-8 grid gap-5 md:grid-cols-2">

                    <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-6">
                        <p className="text-sm font-semibold text-sky-400">
                            CURRENT STATUS
                        </p>

                        <p className="mt-2 text-xl font-bold">
                            Under Review
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Our verification process is checking your submitted roof
                            information.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
                        <p className="text-sm font-semibold text-emerald-400">
                            NEXT STEP
                        </p>

                        <p className="mt-2 text-xl font-bold">
                            Wait for Approval
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Once verification is completed, your approval status will
                            appear here.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}