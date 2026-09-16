import React, { useCallback, useEffect, useState } from 'react';
import { getOwnerRoofs } from '../services/api';

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
            className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white lg:px-8"
        >
            <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-sky-400">
                        Owner Dashboard
                    </p>

                    <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
                        Property Verification Status
                    </h2>

                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                        Track the live verification status of your submitted properties.
                    </p>
                </div>

                {!phoneNumber && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
                        <p className="text-lg font-bold text-amber-300">
                            No owner phone number found
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            Please submit your property details first.
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                        <p className="text-sky-400">
                            Loading your properties...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
                        <p className="text-lg font-bold text-red-300">
                            Unable to load properties
                        </p>
                        <p className="mt-2 text-sm text-red-200/70">
                            {error}
                        </p>

                        <button
                            onClick={fetchRoofs}
                            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && phoneNumber && roofs.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
                        <p className="text-xl font-bold text-white">
                            No properties found
                        </p>

                        <p className="mt-2 text-slate-400">
                            Submit a roof/property to see its verification status here.
                        </p>
                    </div>
                )}

                {!loading && roofs.length > 0 && (
                    <div className="space-y-6">
                        {roofs.map((roof, index) => {
                            const statusConfig = getStatusConfig(
                                roof?.verification_status ||
                                roof?.status
                            );

                            const area = getArea(roof);
                            const propertyType = getPropertyType(roof);

                            return (
                                <div
                                    key={
                                        roof?.id ||
                                        roof?.roof_id ||
                                        roof?.property_id ||
                                        index
                                    }
                                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
                                >
                                    <div className="grid gap-6 md:grid-cols-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Property
                                            </p>

                                            <p className="mt-2 text-xl font-bold capitalize text-white">
                                                {propertyType}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Area
                                            </p>

                                            <p className="mt-2 text-xl font-bold text-white">
                                                {area
                                                    ? `${area} sq ft`
                                                    : 'Not available'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Address / City
                                            </p>

                                            <p className="mt-2 text-lg font-semibold text-white">
                                                {getAddress(roof)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Verification Status
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusConfig.className}`}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-white/10 pt-5">
                                        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                                            {roof?.latitude !== undefined && (
                                                <span>
                                                    Latitude: {roof.latitude}
                                                </span>
                                            )}

                                            {roof?.longitude !== undefined && (
                                                <span>
                                                    Longitude: {roof.longitude}
                                                </span>
                                            )}

                                            {(roof?.id || roof?.roof_id) && (
                                                <span>
                                                    Roof ID:{' '}
                                                    {roof.id || roof.roof_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-5">
                    <p className="text-sm font-semibold text-sky-400">
                        LIVE STATUS
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Property status automatically refreshes every 30 seconds.
                    </p>
                </div>
            </div>
        </section>
    );
}