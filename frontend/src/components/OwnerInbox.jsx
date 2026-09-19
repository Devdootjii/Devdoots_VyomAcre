import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Maximize, MessageSquare, Inbox, Check, X, Satellite, RefreshCw } from 'lucide-react';
import { getOwnerLeaseRequests, updateLeaseRequest } from '../services/api';

/* ============================================================
   VyomAcre — Owner Inbox (lease requests)
   - Filter pills (All / Pending / Leased / Rejected)
   - Interactive request cards with status pills
   - Animated orbit empty state
   - Same backend logic: getOwnerLeaseRequests + updateLeaseRequest
   ============================================================ */

const STATUS_STYLES = {
  leased: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  accepted: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  approved: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  rejected: 'border-red-500/30 bg-red-500/[0.07] text-red-300',
  declined: 'border-red-500/30 bg-red-500/[0.07] text-red-300',
  pending: 'border-amber-500/30 bg-amber-500/[0.07] text-amber-300',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'leased', label: 'Leased' },
  { key: 'rejected', label: 'Rejected' },
];

/* ---------- small info cell ---------- */
function InfoCell({ icon: Icon, label, value, span = false }) {
  return (
    <div
      className={
        'rounded-xl border border-[#182420] bg-[#0A1410] p-4 transition-colors duration-300 hover:border-[#00E585]/20 ' +
        (span ? 'sm:col-span-2' : '')
      }
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#93A096]/70">
        <Icon size={12} />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium text-[#E7EFE9]">{value}</p>
    </div>
  );
}

const OwnerInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');

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

  const normalize = (status) => String(status || 'pending').toLowerCase();

  const getDisplayStatus = (status) => {
    const value = normalize(status);

    if (value === 'accepted' || value === 'approved') return 'Accepted';
    if (value === 'leased') return 'Leased';
    if (value === 'rejected' || value === 'declined') return 'Rejected';

    return 'Pending';
  };

  const counts = useMemo(() => {
    const c = { all: requests.length, pending: 0, leased: 0, rejected: 0 };
    for (const r of requests) {
      const s = normalize(r.status);
      if (s === 'pending' || s === 'requested') c.pending++;
      else if (s === 'leased' || s === 'accepted' || s === 'approved') c.leased++;
      else if (s === 'rejected' || s === 'declined') c.rejected++;
    }
    return c;
  }, [requests]);

  const visibleRequests = useMemo(() => {
    if (filter === 'all') return requests;
    return requests.filter((r) => {
      const s = normalize(r.status);
      if (filter === 'pending') return s === 'pending' || s === 'requested';
      if (filter === 'leased') return s === 'leased' || s === 'accepted' || s === 'approved';
      return s === 'rejected' || s === 'declined';
    });
  }, [requests, filter]);

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#050A08] px-4 text-[#E7EFE9]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
@keyframes vy-orbit { to { transform: rotate(360deg); } }
`}</style>
        <div className="text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#1C2A22]" style={{ animation: 'vy-orbit 1.6s linear infinite' }}>
              <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#00E585] shadow-[0_0_10px_rgba(0,229,133,0.8)]" />
            </div>
            <div className="absolute inset-4 rounded-full border border-[#00E585]/25" style={{ animation: 'vy-orbit 1.1s linear infinite reverse' }}>
              <span className="absolute left-1/2 top-[-2px] h-1 w-1 -translate-x-1/2 rounded-full bg-[#00E585]/80" />
            </div>
            <Inbox size={20} className="text-[#00E585]" />
          </div>
          <p className="mt-6 text-sm text-[#93A096]">Loading lease requests…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#050A08] px-4 py-12 text-[#E7EFE9] sm:px-6"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
@keyframes vy-orbit2 { to { transform: rotate(360deg); } }
@keyframes vy-float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
`}</style>

      <div className="mx-auto max-w-5xl">
        {/* header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#071009]/80 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00E585]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#93A096]">
                Live · Owner
              </span>
            </div>
            <h1 className="vy-head mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Owner <span className="text-[#00E585]">Inbox</span>
            </h1>
            <p className="mt-2 text-sm text-[#93A096]">
              Manage lease requests received for your properties.
            </p>
          </div>

          <button
            onClick={loadRequests}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#1C2A22] bg-[#071009]/80 px-4 py-2.5 text-sm font-medium text-[#C9D6CC] backdrop-blur transition-all duration-300 hover:border-[#00E585]/40 hover:text-[#00E585]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* filter pills */}
        {requests.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    'rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ' +
                    (active
                      ? 'border-[#00E585]/50 bg-[#00E585]/[0.1] text-[#00E585] shadow-[0_0_14px_rgba(0,229,133,0.12)]'
                      : 'border-[#1C2A22] bg-[#071009]/70 text-[#93A096] hover:border-[#00E585]/25 hover:text-[#C9D6CC]')
                  }
                >
                  {f.label}
                  <span className={'ml-2 ' + (active ? 'text-[#00E585]/70' : 'text-[#93A096]/50')}>
                    {counts[f.key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* empty state */}
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#1C2A22] bg-[#071009]/60 px-6 py-16 text-center backdrop-blur sm:py-24"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00E585]/40 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E585]/[0.05] blur-[100px]"
            />

            {/* orbit illustration */}
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center" style={{ animation: 'vy-float2 4s ease-in-out infinite' }}>
              <div className="absolute inset-0 rounded-full border border-[#1C2A22]" style={{ animation: 'vy-orbit2 10s linear infinite' }}>
                <span className="absolute left-1/2 top-[-4px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#00E585] shadow-[0_0_12px_rgba(0,229,133,0.8)]" />
              </div>
              <div className="absolute inset-5 rounded-full border border-[#00E585]/20" style={{ animation: 'vy-orbit2 7s linear infinite reverse' }}>
                <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#00E585]/70" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E585]/25 bg-[#071009]">
                <Satellite size={20} className="text-[#00E585]" />
              </div>
            </div>

            <h2 className="vy-head mt-8 text-2xl font-semibold">No lease requests yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#93A096]">
              When a business or developer shows interest in your rooftop,
              their request will land here with offer details.
            </p>
            <Link
              to="/owner-dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#071009]/80 px-6 py-3 text-sm font-medium text-[#C9D6CC] transition-all duration-300 hover:border-[#00E585]/40 hover:text-[#00E585]"
            >
              View my listings
            </Link>
          </motion.div>
        ) : (
          <div className="mt-8 space-y-5">
            {visibleRequests.map((request, i) => {
              const requestId = request.id;
              const status = normalize(request.status);

              const seekerName =
                request.seeker_name ||
                request.seeker_company_name ||
                request.company_name ||
                request.seeker_phone ||
                'Property Seeker';

              const roofType =
                request.roof_type || request.roof?.roof_type || 'Not specified';

              const area =
                request.area_sqft || request.roof?.area_sqft || 'Not specified';

              const offer =
                request.offer ||
                request.offer_amount ||
                request.offered_amount ||
                request.monthly_offer ||
                null;

              const message =
                request.message || request.description || 'No message provided.';

              const pill = STATUS_STYLES[status] || STATUS_STYLES.pending;

              return (
                <motion.article
                  key={requestId}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                  className="group rounded-2xl border border-[#1C2A22] bg-[#071009]/70 p-6 backdrop-blur transition-all duration-300 hover:border-[#00E585]/25 hover:shadow-[0_16px_44px_rgba(0,0,0,0.35)] sm:p-7"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-[#1C2A22] bg-[#0A1410] transition-colors duration-300 group-hover:border-[#00E585]/40">
                        <Building2 size={18} className="text-[#00E585]" />
                      </div>
                      <div>
                        <h2 className="vy-head text-lg font-semibold text-[#F4F8F5]">{seekerName}</h2>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-[#93A096]/70">
                          Lease Request
                        </p>
                      </div>
                    </div>

                    <span className={'inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ' + pill}>
                      {getDisplayStatus(status)}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <InfoCell icon={Building2} label="Roof Type" value={roofType} />
                    <InfoCell icon={Maximize} label="Area" value={area + ' sqft'} />
                    {offer !== null && (
                      <InfoCell
                        icon={Building2}
                        label="Monthly Offer"
                        value={'₹' + offer}
                        span={false}
                      />
                    )}
                    <InfoCell icon={MessageSquare} label="Message" value={message} span={offer === null} />
                  </div>

                  {(status === 'pending' || status === 'requested') && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={updatingId === requestId}
                        onClick={() => handleStatusUpdate(requestId, 'accepted')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00E585] px-6 py-3 text-sm font-semibold text-[#04160C] shadow-[0_0_18px_rgba(0,229,133,0.2)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(0,229,133,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={15} />
                        {updatingId === requestId ? 'Updating…' : 'Accept'}
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === requestId}
                        onClick={() => handleStatusUpdate(requestId, 'rejected')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-6 py-3 text-sm font-semibold text-red-300 transition-all duration-300 hover:bg-red-500/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={15} />
                        Reject
                      </button>
                    </div>
                  )}

                  {(status === 'leased' || status === 'accepted') && (
                    <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#00E585]/25 bg-[#00E585]/[0.06] px-4 py-3 text-sm text-[#4FFFAB]">
                      <Check size={15} />
                      This property has been leased successfully.
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerInbox;
