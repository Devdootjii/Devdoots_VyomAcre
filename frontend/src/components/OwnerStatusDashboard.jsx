import React from 'react';

export default function OwnerStatusDashboard() {
    return (
        <section
            id="owner-status"
            className="mx-auto max-w-7xl px-6 py-12"
        >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
                        Owner Dashboard
                    </p>

                    <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
                        Roof Verification Status
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Check the current verification status of your submitted roof.
                    </p>
                </div>

                {/* Roof Information */}
                <div className="grid gap-6 md:grid-cols-2">

                    <div className="rounded-xl bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">
                            Owner Name
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-800">
                            Atul
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">
                            Roof Area
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-800">
                            500 sq ft
                        </p>
                    </div>

                </div>

                {/* Status */}
                <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>
                            <p className="text-sm font-semibold text-slate-500">
                                Verification Status
                            </p>

                            <p className="mt-1 text-2xl font-extrabold text-amber-600">
                                Pending
                            </p>
                        </div>

                        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
                            Under Review
                        </span>

                    </div>

                </div>

                {/* Progress */}
                <div className="mt-8">

                    <div className="mb-3 flex justify-between text-sm font-semibold">
                        <span className="text-slate-600">
                            Verification Progress
                        </span>

                        <span className="text-sky-600">
                            50%
                        </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-1/2 rounded-full bg-sky-500" />
                    </div>

                </div>

                {/* Status Steps */}
                <div className="mt-10 grid gap-4 md:grid-cols-3">

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="text-2xl">✅</div>

                        <h3 className="mt-3 font-bold text-slate-800">
                            Submitted
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                            Roof details submitted successfully.
                        </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <div className="text-2xl">🔍</div>

                        <h3 className="mt-3 font-bold text-slate-800">
                            Verification
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                            Your roof is currently being reviewed.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-2xl">🏠</div>

                        <h3 className="mt-3 font-bold text-slate-800">
                            Approved
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                            Approval will appear here after verification.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}