import React from 'react';

export default function OwnerStatusDashboard({ ownerData }) {
    const hasSubmission = Boolean(ownerData);

    const ownerName = ownerData?.owner_name || 'No submission yet';
    const area = ownerData?.area_sqft || 0;
    const propertyType = ownerData?.property_type || 'roof';
    const status = ownerData?.status || 'Pending';

    const propertyLabel =
        propertyType === 'plot' ? 'Plot Area' : 'Roof Area';

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
                        {hasSubmission
                            ? 'Property Verification Status'
                            : 'Track Your Property'}
                    </h2>

                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                        {hasSubmission
                            ? 'Check the current verification status of your submitted property.'
                            : 'Submit your property details to start the verification process.'}
                    </p>
                </div>

                {/* Owner Information Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                    <div className="grid gap-8 md:grid-cols-4">

                        {/* Owner Name */}
                        <div className="border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0">
                            <p className="text-sm font-medium text-slate-500">
                                Owner Name
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {ownerName}
                            </p>
                        </div>

                        {/* Property Type */}
                        <div className="border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pl-8">
                            <p className="text-sm font-medium text-slate-500">
                                Property Type
                            </p>

                            <p className="mt-2 text-2xl font-bold capitalize text-white">
                                {propertyType}
                            </p>
                        </div>

                        {/* Area */}
                        <div className="border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pl-8">
                            <p className="text-sm font-medium text-slate-500">
                                {propertyLabel}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {area > 0 ? `${area} sq ft` : 'Not submitted'}
                            </p>
                        </div>

                        {/* Verification Status */}
                        <div className="md:pl-8">
                            <p className="text-sm font-medium text-slate-500">
                                Verification Status
                            </p>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-2xl font-bold text-amber-400">
                                    {status}
                                </span>

                                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                    {status === 'Pending'
                                        ? 'Under Review'
                                        : status}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Verification Progress */}
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>
                            <p className="text-2xl font-bold">
                                Verification Progress
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {hasSubmission
                                    ? 'Your property verification is currently in progress.'
                                    : 'Verification will begin after property submission.'}
                            </p>
                        </div>

                        <p className="text-4xl font-black text-sky-400">
                            {hasSubmission ? '50%' : '0%'}
                        </p>

                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shadow-lg shadow-sky-500/20"
                            style={{
                                width: hasSubmission ? '50%' : '0%',
                            }}
                        />
                    </div>

                    {/* Verification Steps */}
                    <div className="mt-12 grid gap-8 md:grid-cols-3">

                        {/* Submitted */}
                        <div className="relative">

                            <div
                                className={`mb-5 h-1 rounded-full ${hasSubmission
                                        ? 'bg-emerald-400'
                                        : 'bg-slate-700'
                                    }`}
                            />

                            <p
                                className={`text-lg font-bold ${hasSubmission
                                        ? 'text-emerald-400'
                                        : 'text-slate-500'
                                    }`}
                            >
                                Submitted
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Property details submitted successfully.
                            </p>

                            <p
                                className={`mt-4 text-xs font-semibold uppercase tracking-wider ${hasSubmission
                                        ? 'text-emerald-400'
                                        : 'text-slate-600'
                                    }`}
                            >
                                {hasSubmission ? 'Completed' : 'Waiting'}
                            </p>

                        </div>

                        {/* Verification */}
                        <div className="relative">

                            <div
                                className={`mb-5 h-1 rounded-full ${hasSubmission
                                        ? 'bg-sky-400'
                                        : 'bg-slate-700'
                                    }`}
                            />

                            <p
                                className={`text-lg font-bold ${hasSubmission
                                        ? 'text-sky-400'
                                        : 'text-slate-500'
                                    }`}
                            >
                                Verification
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Your property is reviewed by the verification system.
                            </p>

                            <p
                                className={`mt-4 text-xs font-semibold uppercase tracking-wider ${hasSubmission
                                        ? 'text-sky-400'
                                        : 'text-slate-600'
                                    }`}
                            >
                                {hasSubmission ? 'In Progress' : 'Waiting'}
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
                            {hasSubmission ? 'Under Review' : 'No Submission'}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            {hasSubmission
                                ? 'Your submitted property information is currently being reviewed.'
                                : 'Submit your roof or plot details to start the verification process.'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
                        <p className="text-sm font-semibold text-emerald-400">
                            NEXT STEP
                        </p>

                        <p className="mt-2 text-xl font-bold">
                            {hasSubmission
                                ? 'Wait for Approval'
                                : 'Submit Property'}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            {hasSubmission
                                ? 'Once verification is completed, your approval status will appear here.'
                                : 'Complete the owner listing form to submit your property for verification.'}
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}
