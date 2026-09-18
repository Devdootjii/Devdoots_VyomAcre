import React, { useEffect, useState } from 'react';
import {
  getOwnerLeaseRequests,
  updateLeaseRequest,
} from '../services/api';

const OwnerInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const getOwnerPhone = () => {
    const owner = localStorage.getItem('vyomacre_owner');
    const user = localStorage.getItem('vyomacre_user');

    try {
      const ownerData = owner ? JSON.parse(owner) : null;
      if (ownerData?.phone_number) return ownerData.phone_number;
      if (ownerData?.phone) return ownerData.phone;
    } catch {
      // Ignore invalid stored owner data
    }

    try {
      const userData = user ? JSON.parse(user) : null;
      if (userData?.phone_number) return userData.phone_number;
      if (userData?.phone) return userData.phone;
    } catch {
      // Ignore invalid stored user data
    }

    return '';
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const ownerPhone = getOwnerPhone();

      if (!ownerPhone) {
        setRequests([]);
        setError('Owner information not found. Please login again.');
        return;
      }

      const data = await getOwnerLeaseRequests(ownerPhone);

      const requestList = Array.isArray(data)
        ? data
        : data?.requests || data?.data || [];

      setRequests(requestList);
    } catch (err) {
      console.error('Failed to load lease requests:', err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to load lease requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);
      setError('');

      await updateLeaseRequest(id, status);

      setRequests((previous) =>
        previous.map((request) =>
          request.id === id
            ? { ...request, status }
            : request
        )
      );
    } catch (err) {
      console.error('Failed to update lease request:', err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to update lease request.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'approved':
      case 'accepted':
      case 'leased':
        return 'bg-green-500/10 text-green-400 border-green-500/30';

      case 'rejected':
      case 'declined':
        return 'bg-red-500/10 text-red-400 border-red-500/30';

      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  const getDisplayStatus = (status) => {
    const value = String(status || 'pending').toLowerCase();

    if (value === 'accepted' || value === 'approved') {
      return 'Accepted';
    }

    if (value === 'leased') {
      return 'Leased';
    }

    if (value === 'rejected' || value === 'declined') {
      return 'Rejected';
    }

    return 'Pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-slate-400">
            Loading lease requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Owner Inbox
          </h1>

          <p className="mt-2 text-slate-400">
            Manage lease requests received for your properties.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No Lease Requests
            </h2>

            <p className="mt-2 text-slate-400">
              You don't have any lease requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const requestId = request.id;
              const status = String(
                request.status || 'pending'
              ).toLowerCase();

              const seekerName =
                request.seeker_name ||
                request.seeker_company_name ||
                request.company_name ||
                request.seeker_phone ||
                'Property Seeker';

              const roofType =
                request.roof_type ||
                request.roof?.roof_type ||
                'Not specified';

              const area =
                request.area_sqft ||
                request.roof?.area_sqft ||
                'Not specified';

              const offer =
                request.offer ||
                request.offer_amount ||
                request.offered_amount ||
                request.monthly_offer ||
                null;

              const message =
                request.message ||
                request.description ||
                'No message provided.';

              return (
                <div
                  key={requestId}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div>
                      <h2 className="text-xl font-semibold">
                        {seekerName}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Lease Request
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-medium ${getStatusClass(
                        status
                      )}`}
                    >
                      {getDisplayStatus(status)}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Roof Type
                      </p>
                      <p className="mt-1 font-medium">
                        {roofType}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Area
                      </p>
                      <p className="mt-1 font-medium">
                        {area} sqft
                      </p>
                    </div>

                    {offer !== null && (
                      <div className="rounded-xl bg-slate-950 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Offer
                        </p>
                        <p className="mt-1 font-medium">
                          ₹{offer}
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl bg-slate-950 p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Message
                      </p>
                      <p className="mt-1 text-slate-300">
                        {message}
                      </p>
                    </div>
                  </div>

                  {(status === 'pending' ||
                    status === 'requested') && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        disabled={updatingId === requestId}
                        onClick={() =>
                          handleStatusUpdate(
                            requestId,
                            'leased'
                          )
                        }
                        className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === requestId
                          ? 'Updating...'
                          : 'Accept'}
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === requestId}
                        onClick={() =>
                          handleStatusUpdate(
                            requestId,
                            'rejected'
                          )
                        }
                        className="rounded-lg border border-red-500/50 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>

                    </div>
                  )}

                  {status === 'leased' && (
                    <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                      This property has been leased successfully.
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerInbox;
