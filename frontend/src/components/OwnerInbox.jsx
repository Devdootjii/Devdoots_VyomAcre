import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'https://devdoots-vyomacre-y0gr.onrender.com';

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
            } catch (error) {
                console.error('Failed to read owner data:', error);
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
            const response = await axios.get(
                `${API_BASE_URL}/api/lease-requests`,
                {
                    params: {
                        owner_id: phone,
                    },
                }
            );

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
            await axios.patch(
                `${API_BASE_URL}/api/lease-requests/${requestId}`,
                {
                    status,
                }
            );

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
                `Unable to ${status.toLowerCase()} this request.`
            );
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    Owner Inbox
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Manage lease requests from companies.
                </p>
            </div>

            {loading && (
                <div className="py-8 text-center text-slate-500">
                    Loading lease requests...
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && requests.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-8 text-center">
                    <p className="font-medium text-slate-700">
                        No lease requests found.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        New company requests will appear here.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="rounded-xl border border-slate-200 p-5"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {request.company_name || 'Company Request'}
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                    Roof ID: {request.roof_id || 'N/A'}
                                </p>

                                <p className="text-sm text-slate-600">
                                    Requested on:{' '}
                                    {request.created_at
                                        ? new Date(request.created_at).toLocaleDateString()
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
                                        handleRequestAction(request.id, 'accepted')
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
                                        handleRequestAction(request.id, 'rejected')
                                    }
                                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}