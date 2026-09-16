import React from 'react';
import { motion } from 'framer-motion';

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

// Backticks aur brackets parser conflict se bachne ke liye string concatenation use kiya hai
function AmbientGlow({ className = '' }) {
    return (
        <div
            aria-hidden="true"
            className={"pointer-events-none absolute rounded-full bg-emerald-500/10 blur-[120px] " + className}
        />
    );
}

function StatusBadge({ status }) {
    const isPending = status === 'Pending';

    return (
        <span
            className={
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] " +
                (isPending
                    ? "border-amber-400/20 bg-amber-400/[0.05] text-amber-300"
                    : "border-[#00FF87]/20 bg-[#00FF87]/[0.05] text-[#00FF87]")
            }
        >
            <span
                className={
                    "h-1.5 w-1.5 rounded-full " +
                    (isPending
                        ? "bg-amber-300"
                        : "bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.75)]")
                }
            />
            {status === 'Pending' ? 'Under Review' : status}
        </span>
    );
}

function DashboardStat({ label, value, status = false, border = true }) {
    return (
        <div
            className={
                (border ? 'border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 ' : '') +
                'md:last:border-r-0'
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
                <p className="mt-3 text-2xl font-medium tracking-[-0.045em] text-white">
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
    lineActive,
    lineCurrent,
}) {
    const completed = state === 'completed';
    const current = state === 'current';

    return (
        <div className="relative">
            <div
                className={
                    "mb-5 h-1 rounded-full transition-all duration-500 " +
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
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] " +
                        (completed
                            ? 'border-[#00FF87]/25 bg-[#00FF87]/[0.08] text-[#00FF87]'
                            : current
                                ? 'border-[#00FF87]/30 bg-[#00FF87]/[0.06] text-[#00FF87]'
                                : 'border-white/10 bg-white/[0.025] text-slate-600')
                    }
                >
                    {completed ? '✓' : current ? '•' : '—'}
                </span>

                <div>
                    <p
                        className={
                            "text-lg font-medium tracking-[-0.03em] " +
                            (completed || current ? 'text-white' : 'text-slate-500')
                        }
                    >
                        {title}
                    </p>
                </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
                {description}
            </p>

            <p
                className={
                    "mt-4 text-[9px] font-semibold uppercase tracking-[0.16em] " +
                    (completed
                        ? 'text-[#00FF87]'
                        : current
                            ? 'text-[#00FF87]/75'
                            : 'text-slate-700')
                }
            >
                {completed ? 'Completed' : current ? 'In Progress' : 'Waiting'}
            </p>
        </div>
    );
}

export default function OwnerStatusDashboard({ ownerData }) {
    const [roofs, setRoofs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const phoneNumber =
        ownerData?.phone_number ||
        ownerData?.owner_phone ||
        localStorage.getItem('vyomacre_owner_phone') ||
        '';

    const fetchRoofs = useCallback(async () => {
        if (!phoneNumber) {
            setRoofs([]);
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
            console.error('Failed to fetch owner roofs:', err);
            setError(
                err?.response?.data?.detail ||
                'Unable to load your property listings.'
            );
        } finally {
            setLoading(false);
        }
    }, [phoneNumber]);

    useEffect(() => {
        fetchRoofs();

        const interval = setInterval(fetchRoofs, 30000);

        return () => clearInterval(interval);
    }, [fetchRoofs]);

    const getStatusConfig = (status) => {
        const normalizedStatus = String(status || '')
            .toLowerCase()
            .trim();

        if (normalizedStatus === 'verified') {
            return {
                label: 'Verified',
                className:
                    'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
            };
        }

        if (normalizedStatus === 'flagged') {
            return {
                label: 'Flagged',
                className:
                    'border-red-400/30 bg-red-400/10 text-red-300',
            };
        }

        return {
            label: 'Pending Verification',
            className:
                'border-amber-400/30 bg-amber-400/10 text-amber-300',
        };
    };

    const getArea = (roof) =>
        roof?.area_sqft ??
        roof?.estimated_area_sqft ??
        roof?.estimatedAreaSqft ??
        0;

    const getPropertyType = (roof) =>
        roof?.property_type ||
        roof?.propertyType ||
        'roof';

    const getAddress = (roof) =>
        roof?.address ||
        roof?.city ||
        'Address not available';

    return (
        <section
            id="owner-status"
            className="relative overflow-hidden bg-[#020706] px-5 py-20 text-white sm:px-6 lg:px-8"
        >
            {/* Background Glows */}
            <AmbientGlow className="-left-40 top-20 h-96 w-96" />
            <AmbientGlow className="-right-40 bottom-10 h-96 w-96" />

            {/* Subtle Grid */}
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
                {/* Header */}
                <motion.div
                    variants={reveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="mb-10"
                >
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00FF87]">
                        Owner Dashboard
                    </p>

                    <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                        {hasSubmission
                            ? 'Property Verification Status'
                            : 'Track Your Property'}
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                        {hasSubmission
                            ? 'Check the current verification status of your submitted property.'
                            : 'Submit your property details to start the verification process.'}
                    </p>
                </motion.div>

                {/* Owner Information Card */}
                <motion.div
                    variants={reveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#00FF87]/[0.025] blur-[70px]"
                    />

                    <div className="relative grid gap-7 md:grid-cols-4 md:gap-0">
                        <div className="md:pr-8">
                            <DashboardStat
                                label="Owner Name"
                                value={ownerName}
                                border
                            />
                        </div>

                        <div className="md:border-b-0 md:pr-8 md:pl-8">
                            <DashboardStat
                                label="Property Type"
                                value={propertyType}
                                border
                            />
                        </div>

                        <div className="md:pr-8 md:pl-8">
                            <DashboardStat
                                label={propertyLabel}
                                value={
                                    area > 0
                                        ? `${area} sq ft`
                                        : 'Not submitted'
                                }
                                border
                            />
                        </div>

                        <div className="md:pl-8">
                            <DashboardStat
                                label="Verification Status"
                                value={status}
                                status
                                border={false}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Verification Progress */}
                <motion.div
                    variants={reveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:mt-8 sm:p-8"
                >
                    <AmbientGlow className="right-[-10%] top-[30%] h-56 w-56" />

                    <div className="relative flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <p className="text-2xl font-medium tracking-[-0.04em] text-white">
                                Verification Progress
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                {hasSubmission
                                    ? 'Your property verification is currently in progress.'
                                    : 'Verification will begin after property submission.'}
                            </p>
                        </div>

                        <p className="font-mono text-3xl tracking-[-0.04em] text-[#00FF87] sm:text-4xl">
                            {hasSubmission ? '50%' : '0%'}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                                width: hasSubmission ? '50%' : '0%',
                            }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 1,
                                delay: 0.15,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-[#00FF87] to-[#00B8FF] shadow-[0_0_14px_rgba(0,255,135,0.25)]"
                        />
                    </div>

                    {/* Verification Steps */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10"
                    >
                        <motion.div variants={reveal}>
                            <VerificationStep
                                title="Submitted"
                                description="Property details submitted successfully."
                                state={hasSubmission ? 'completed' : 'waiting'}
                                lineActive={hasSubmission}
                            />
                        </motion.div>

                        <motion.div variants={reveal}>
                            <VerificationStep
                                title="Verification"
                                description="Your property is reviewed by the verification system."
                                state={hasSubmission ? 'current' : 'waiting'}
                                lineCurrent={hasSubmission}
                            />
                        </motion.div>

                        <motion.div variants={reveal}>
                            <VerificationStep
                                title="Approved"
                                description="Approval will appear here after verification."
                                state="waiting"
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Bottom Information */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className="mt-5 grid gap-4 md:mt-8 md:grid-cols-2"
                >
                    <motion.div
                        variants={reveal}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#00FF87]/[0.025] blur-3xl"
                        />

                        <div className="relative">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#00FF87]">
                                CURRENT STATUS
                            </p>

                            <p className="mt-3 text-xl font-medium tracking-[-0.035em] text-white">
                                {hasSubmission ? 'Under Review' : 'No Submission'}
                            </p>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                {hasSubmission
                                    ? 'Your submitted property information is currently being reviewed.'
                                    : 'Submit your roof or plot details to start the verification process.'}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={reveal}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#00FF87]/[0.02] blur-3xl"
                        />

                        <div className="relative">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#00FF87]">
                                NEXT STEP
                            </p>

                            <p className="mt-3 text-xl font-medium tracking-[-0.035em] text-white">
                                {hasSubmission
                                    ? 'Wait for Approval'
                                    : 'Submit Property'}
                            </p>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                {hasSubmission
                                    ? 'Once verification is completed, your approval status will appear here.'
                                    : 'Complete the owner listing form to submit your property for verification.'}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}