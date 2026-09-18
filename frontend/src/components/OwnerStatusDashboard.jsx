import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getOwnerRoofs } from '../services/api';

const reveal = {
    hidden: {
        opacity: 0,
        y: 28,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

function AmbientGlow({ className = '' }) {
    return (
        <div
            aria-hidden="true"
            className={
                'pointer-events-none absolute rounded-full bg-emerald-500/10 blur-[120px] ' +
                className
            }
        />
    );
}

function StatusBadge({ status }) {
    const normalized = String(status || '').toLowerCase();

    let label = 'Pending';
    let classes =
        'border-amber-400/20 bg-amber-400/[0.05] text-amber-300';

    if (normalized === 'verified' || normalized === 'approved') {
        label = 'Approved';
        classes =
            'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300';
    }

    if (normalized === 'flagged' || normalized === 'rejected') {
        label = 'Rejected';
        classes =
            'border-red-400/20 bg-red-400/[0.05] text-red-300';
    }

    return (
        <span
            className={
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] ' +
                classes
            }
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}

function DashboardStat({
    label,
    value,
    status = false,
    border = true,
}) {
    return (
        <div
            className={
                (border
                    ? 'border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 '
                    : '') + 'md:last:border-r-0'
            }
        >
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                {label}
            </p>

            {status ? (
                <div className="mt-3">
                    <StatusBadge status={value} />
                </div>
            ) : (
                <p className="mt-3 break-words text-2xl font-medium tracking-[-0.045em] text-white">
                    {value}
                </p>
            )}
        </div>
    );
}

function VerificationStep({
    title,
    description,
    state,
}) {
    const completed = state === 'completed';
    const current = state === 'current';

    return (
        <div className="relative">
            <div
                className={
                    'mb-5 h-1 rounded-full transition-all duration-500 ' +
                    (completed
                        ? 'bg-[#00FF87] shadow-[0_0_10px_rgba(0,255,135,0.22)]'
                        : current
                            ? 'bg-gradient-to-r from-[#00FF87] to-[#00B8FF] shadow-[0_0_10px_rgba(0,255,135,0.16)]'
                            : 'bg-white/10')
                }
            />

            <div className="flex items-center gap-3">
                <span
                    className={
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ' +
                        (completed
                            ? 'border-[#00FF87]/25 bg-[#00FF87]/[0.08] text-[#00FF87]'
                            : current
                                ? 'border-[#00FF87]/30 bg-[#00FF87]/[0.06] text-[#00FF87]'
                                : 'border-white/10 bg-white/[0.025] text-slate-600')
                    }
                >
                    {completed ? '✓' : current ? '•' : '—'}
                </span>

                <p
                    className={
                        'text-lg font-medium tracking-[-0.03em] ' +
                        (completed || current
                            ? 'text-white'
                            : 'text-slate-500')
                    }
                >
                    {title}
                </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
                {description}
            </p>

            <p
                className={
                    'mt-4 text-[9px] font-semibold uppercase tracking-[0.16em] ' +
                    (completed
                        ? 'text-[#00FF87]'
                        : current
                            ? 'text-[#00FF87]/75'
                            : 'text-slate-700')
                }
            >
                {completed
                    ? 'Completed'
                    : current
                        ? 'In Progress'
                        : 'Waiting'}
            </p>
        </div>
    );
}

export default function OwnerStatusDashboard({ ownerData }) {
    const navigate = useNavigate();

    const [roofs, setRoofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const storedOwner =
        localStorage.getItem('vyomacre_owner') || '';
    const storedUser =
        localStorage.getItem('vyomacre_user') || '';

    let parsedOwner = null;
    let parsedUser = null;

    try {
        parsedOwner = storedOwner
            ? JSON.parse(storedOwner)
            : null;
    } catch {
        parsedOwner = null;
    }

    try {
        parsedUser = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        parsedUser = null;
    }

    const currentOwner = ownerData || parsedOwner || parsedUser;

    const phoneNumber =
        currentOwner?.phone_number ||
        currentOwner?.phone ||
        currentOwner?.owner_phone ||
        localStorage.getItem('vyomacre_owner_phone') ||
        '';

    const ownerName =
        currentOwner?.owner_name ||
        currentOwner?.name ||
        'Owner';

    const fetchRoofs = useCallback(async () => {
        if (!phoneNumber) {
            setRoofs([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await getOwnerRoofs(phoneNumber);

            const data =
                response?.data?.data ||
                response?.data?.roofs ||
                response?.data ||
                [];

            setRoofs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                'Failed to fetch owner roofs:',
                err
            );

            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                'Unable to load your property listings.'
            );
        } finally {
            setLoading(false);
        }
    }, [phoneNumber]);

    useEffect(() => {
        fetchRoofs();

        const interval = setInterval(
            fetchRoofs,
            30000
        );

        return () => clearInterval(interval);
    }, [fetchRoofs]);

    const hasSubmission = roofs.length > 0;

    const latestRoof = roofs[0] || {};

    const area =
        latestRoof?.area_sqft ??
        latestRoof?.estimated_area_sqft ??
        latestRoof?.estimatedAreaSqft ??
        0;

    const propertyType =
        latestRoof?.property_type ||
        latestRoof?.propertyType ||
        latestRoof?.roof_type ||
        'Roof';

    const propertyLabel =
        latestRoof?.area_sqft != null
            ? 'Area'
            : 'Property';

    const status =
        latestRoof?.status ||
        latestRoof?.verification_status ||
        'pending';

    const address =
        latestRoof?.address ||
        latestRoof?.city ||
        'Address not available';

    const getStatusText = (value) => {
        const normalized = String(
            value || ''
        ).toLowerCase();

        if (
            normalized === 'verified' ||
            normalized === 'approved'
        ) {
            return 'Approved';
        }

        if (
            normalized === 'flagged' ||
            normalized === 'rejected'
        ) {
            return 'Rejected';
        }

        return 'Pending';
    };

    const displayStatus = getStatusText(status);

    return (
        <section
            id="owner-status"
            className="relative min-h-screen overflow-hidden bg-[#020706] px-5 py-20 text-white sm:px-6 lg:px-8"
        >
            <AmbientGlow className="-left-40 top-20 h-96 w-96" />
            <AmbientGlow className="-right-40 bottom-10 h-96 w-96" />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '64px 64px',
                }}
            />

            <div className="relative mx-auto max-w-7xl">

                <motion.div
                    variants={reveal}
                    initial="hidden"
                    animate="visible"
                    className="mb-10"
                >
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00FF87]">
                        Owner Dashboard
                    </p>

                    <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                        Meri Roofs
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                        Track your submitted properties and their
                        verification status.
                    </p>
                </motion.div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-center">
                        <p className="text-slate-400">
                            Loading your properties...
                        </p>
                    </div>
                ) : !hasSubmission ? (
                    <motion.div
                        variants={reveal}
                        initial="hidden"
                        animate="visible"
                        className="rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center backdrop-blur-xl"
                    >
                        <p className="text-xl font-medium text-white">
                            No Roofs Submitted
                        </p>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                            You haven't submitted any roof or property
                            yet. Add your property to start verification.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/owner/new-roof')
                            }
                            className="mt-6 rounded-xl bg-[#00FF87] px-6 py-3 font-semibold text-slate-950 transition hover:bg-[#00e97b]"
                        >
                            + Add New Roof
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            variants={reveal}
                            initial="hidden"
                            animate="visible"
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8"
                        >
                            <div className="relative grid gap-7 md:grid-cols-4 md:gap-0">

                                <div className="md:pr-8">
                                    <DashboardStat
                                        label="Owner Name"
                                        value={ownerName}
                                    />
                                </div>

                                <div className="md:px-8">
                                    <DashboardStat
                                        label="Property Type"
                                        value={propertyType}
                                    />
                                </div>

                                <div className="md:px-8">
                                    <DashboardStat
                                        label={propertyLabel}
                                        value={
                                            area > 0
                                                ? `${area} sq ft`
                                                : 'AI Calculating'
                                        }
                                    />
                                </div>

                                <div className="md:pl-8">
                                    <DashboardStat
                                        label="Verification Status"
                                        value={displayStatus}
                                        status
                                        border={false}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={reveal}
                            initial="hidden"
                            animate="visible"
                            className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8"
                        >
                            <div>
                                <p className="text-2xl font-medium tracking-[-0.04em] text-white">
                                    Property Details
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Address
                                </p>

                                <p className="mt-1 text-base text-slate-300">
                                    {address}
                                </p>
                            </div>

                            <div className="mt-8 grid gap-8 md:grid-cols-3">
                                <VerificationStep
                                    title="Submitted"
                                    description="Property details have been submitted successfully."
                                    state="completed"
                                />

                                <VerificationStep
                                    title="Verification"
                                    description="Your property is being reviewed by the verification system."
                                    state={
                                        displayStatus === 'Pending'
                                            ? 'current'
                                            : 'completed'
                                    }
                                />

                                <VerificationStep
                                    title="Approved"
                                    description="Approval will appear here after verification is completed."
                                    state={
                                        displayStatus === 'Approved'
                                            ? 'completed'
                                            : 'waiting'
                                    }
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                            className="mt-8 grid gap-4 md:grid-cols-2"
                        >
                            <motion.div
                                variants={reveal}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#00FF87]">
                                    CURRENT STATUS
                                </p>

                                <p className="mt-3 text-xl font-medium text-white">
                                    {displayStatus}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Your latest property verification
                                    status is shown above.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={reveal}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#00FF87]">
                                    NEXT STEP
                                </p>

                                <p className="mt-3 text-xl font-medium text-white">
                                    {displayStatus === 'Approved'
                                        ? 'Property Verified'
                                        : 'Wait for Approval'}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {displayStatus === 'Approved'
                                        ? 'Your property has completed the verification process.'
                                        : 'Once verification is completed, your approval status will appear here.'}
                                </p>
                            </motion.div>
                        </motion.div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/owner/new-roof')
                            }
                            className="mt-8 rounded-xl border border-[#00FF87]/30 px-6 py-3 font-semibold text-[#00FF87] transition hover:bg-[#00FF87]/10"
                        >
                            + Add New Roof
                        </button>
                    </>
                )}
            </div>
        </section>
    );
} 