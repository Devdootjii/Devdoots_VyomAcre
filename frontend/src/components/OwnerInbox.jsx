import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import {
    getOwnerLeaseRequests,
    updateLeaseRequest,
} from '../services/api';
=======
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://devdoots-vyomacre-y0gr.onrender.com';
>>>>>>> origin/main

export default function OwnerInbox() {
    const [requests, setRequests] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedOwnerData = localStorage.getItem('vyomacre_owner_data');

        if (savedOwnerData) {
            try {
                const owner = JSON.parse(savedOwnerData);
                setOwnerId(owner.phone_number || '');
            } catch (err) {
                console.error('Failed to read owner data:', err);
            }
        }
    }, []);

    useEffect(() => {
        if (ownerId) {
            fetchRequests(ownerId);
        }
    }, [ownerId]);

    const fetchRequests = async (phone) => {
        setLoading(true);
        setError('');

        try {
<<<<<<< HEAD
            const response = await getOwnerLeaseRequests(phone);
=======
            const response = await axios.get(`${API_BASE_URL}/api/lease-requests`, {
                params: {
                    owner_id: phone,
                },
            });
>>>>>>> origin/main

            const data = response?.data?.data;

            if (Array.isArray(data)) {
                setRequests(data);
            } else if (Array.isArray(response?.data)) {
                setRequests(response.data);
            } else {
                setRequests([]);
            }
        } catch (apiError) {
            console.error('Failed to load lease requests:', apiError);

            setError(
                apiError?.response?.data?.message ||
                apiError?.response?.data?.detail ||
                'Unable to load lease requests. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId, status) => {
        setActionLoading(requestId);
        setError('');

        try {
<<<<<<< HEAD
            await updateLeaseRequest(requestId, status);
=======
            await axios.patch(`${API_BASE_URL}/api/lease-requests/${requestId}`, {
                status: status,
            });
>>>>>>> origin/main

            setRequests((currentRequests) =>
                currentRequests.map((request) =>
                    request.id === requestId
                        ? { ...request, status }
                        : request
                )
            );
        } catch (apiError) {
            console.error('Failed to update lease request:', apiError);

            setError(
                apiError?.response?.data?.message ||
                apiError?.response?.data?.detail ||
                `Unable to ${status.toLowerCase()} this request.`
            );
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyles = (status) => {
        const normalizedStatus = (status || 'Pending').toLowerCase();

        if (normalizedStatus === 'accepted') {
            return {
                wrapper: 'border-[#00FF87]/20 bg-[#00FF87]/[0.06]',
                dot: 'bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.75)]',
                text: 'text-[#00FF87]',
            };
        }

        if (normalizedStatus === 'rejected') {
            return {
                wrapper: 'border-red-500/20 bg-red-500/[0.07]',
                dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.45)]',
                text: 'text-red-300',
            };
        }

        return {
            wrapper: 'border-amber-400/20 bg-amber-400/[0.06]',
            dot: 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.4)]',
            text: 'text-amber-300',
        };
    };

    return (
<<<<<<< HEAD
        <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    Owner Inbox
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Manage lease requests from companies.
                </p>
            </div>
=======
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
            {/* Ambient Glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#00FF87]/[0.035] blur-[110px]"
            />
>>>>>>> origin/main

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[#00FF87]/[0.02] blur-[110px]"
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="mb-7">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.75)]" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                            Owner Portal
                        </span>
                    </div>

<<<<<<< HEAD
            {!loading && !error && requests.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-8 text-center">
                    <p className="font-medium text-slate-700">
                        No lease requests found.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        New company requests will appear here.
=======
                    <h2 className="mt-3 text-2xl font-medium tracking-[-0.05em] text-white sm:text-3xl">
                        Owner Inbox
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Manage lease requests from companies.
>>>>>>> origin/main
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <span className="relative flex h-5 w-5 items-center justify-center">
                                <span className="absolute h-5 w-5 animate-spin rounded-full border border-white/10 border-t-[#00FF87]" />
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.65)]" />
                            </span>

<<<<<<< HEAD
                                <p className="mt-1 text-sm text-slate-600">
                                    Roof ID: {request.roof_id || 'N/A'}
                                </p>

                                <p className="text-sm text-slate-600">
                                    Requested on:{' '}
                                    {request.created_at
                                        ? new Date(
                                            request.created_at
                                        ).toLocaleDateString()
                                        : 'N/A'}
                                </p>

                                <p className="mt-2 text-sm font-semibold">
                                    Status:{' '}
                                    <span className="capitalize">
                                        {request.status || 'Pending'}
                                    </span>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={
                                        actionLoading === request.id ||
                                        request.status === 'accepted'
                                    }
                                    onClick={() =>
                                        handleRequestAction(
                                            request.id,
                                            'accepted'
                                        )
                                    }
                                    className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading === request.id
                                        ? 'Updating...'
                                        : 'Accept'}
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        actionLoading === request.id ||
                                        request.status === 'rejected'
                                    }
                                    onClick={() =>
                                        handleRequestAction(
                                            request.id,
                                            'rejected'
                                        )
                                    }
                                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
=======
                            <span className="text-sm text-slate-500">
                                Loading lease requests...
                            </span>
>>>>>>> origin/main
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/[0.08] text-xs text-red-300">
                                !
                            </span>

                            <p className="leading-6">{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && requests.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025]">
                            <svg
                                aria-hidden="true"
                                className="h-5 w-5 text-slate-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <p className="mt-4 font-medium text-slate-400">
                            No lease requests found.
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            New company requests will appear here.
                        </p>
                    </div>
                )}

                {/* Request List */}
                <div className="space-y-3">
                    {requests.map((request) => {
                        const currentStatus = request.status || 'Pending';
                        const statusStyles = getStatusStyles(currentStatus);

                        return (
                            <div
                                key={request.id}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.035] hover:shadow-[0_0_28px_rgba(0,255,135,0.035)]"
                            >
                                {/* Hover Accent */}
                                <div
                                    aria-hidden="true"
                                    className="absolute left-0 top-0 h-full w-px bg-[#00FF87] opacity-0 shadow-[0_0_10px_rgba(0,255,135,0.5)] transition-opacity duration-300 group-hover:opacity-60"
                                />

                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                    {/* Request Details */}
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-base font-medium tracking-[-0.02em] text-white sm:text-lg">
                                                {request.company_name || 'Company Request'}
                                            </h3>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] ${statusStyles.wrapper} ${statusStyles.text}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                                                />
                                                {currentStatus}
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-1.5">
                                            <p className="text-xs text-slate-500">
                                                <span className="text-slate-600">
                                                    Roof ID:
                                                </span>{' '}
                                                <span className="font-mono text-slate-400">
                                                    {request.roof_id || 'N/A'}
                                                </span>
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                <span className="text-slate-600">
                                                    Requested on:
                                                </span>{' '}
                                                {request.created_at
                                                    ? new Date(
                                                          request.created_at
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-700">
                                                Current status
                                            </span>

                                            <span
                                                className={`text-xs font-semibold capitalize ${statusStyles.text}`}
                                            >
                                                {currentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                actionLoading === request.id ||
                                                request.status === 'accepted'
                                            }
                                            onClick={() =>
                                                handleRequestAction(request.id, 'accepted')
                                            }
                                            className="rounded-xl bg-[#00FF87] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.25)] transition-all hover:shadow-[0_0_22px_rgba(0,255,135,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                        >
                                            {actionLoading === request.id
                                                ? 'Updating...'
                                                : 'Accept'}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                actionLoading === request.id ||
                                                request.status === 'rejected'
                                            }
                                            onClick={() =>
                                                handleRequestAction(request.id, 'rejected')
                                            }
                                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}