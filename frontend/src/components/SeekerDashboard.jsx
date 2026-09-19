import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Building2, Ruler, Crosshair, Send, ShieldCheck, Check,
  Phone, User, Clock, MapPin, Inbox, Layers,
} from 'lucide-react';
import apiClient, { getFilteredRoofs, getVerifiedRoofs, getSeekerLeaseRequests, createLeaseRequest } from '../services/api';

/* ============================================================
   VyomAcre — Seeker Dashboard (discover + one-click request)
   - GET /api/roofs            → total onboarded
   - GET /api/roofs/verified   → verified & available rooftops
   - GET /api/lease-requests/mine → seeker's own requests (inbox)
   - GET /api/roofs/{id}       → owner contact unlock after accept
   - POST /api/lease-requests   → one-click request
   ============================================================ */

const STATUS_STYLES = {
  accepted: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  leased: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  approved: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  rejected: 'border-red-500/30 bg-red-500/[0.07] text-red-300',
  declined: 'border-red-500/30 bg-red-500/[0.07] text-red-300',
  pending: 'border-amber-500/30 bg-amber-500/[0.07] text-amber-300',
};

const normalize = (s) => String(s || 'pending').toLowerCase();
const isAccepted = (s) => ['accepted', 'leased', 'approved'].includes(normalize(s));
const isRejected = (s) => ['rejected', 'declined'].includes(normalize(s));

const displayStatus = (s) => {
  const v = normalize(s);
  if (isAccepted(v)) return 'Accepted';
  if (isRejected(v)) return 'Rejected';
  return 'Pending';
};

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

/* response may be array / {data:[..]} / {data:{roofs:[..]}} / {roofs:[..]} */
const pickList = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.data && Array.isArray(raw.data.roofs)) return raw.data.roofs;
  if (Array.isArray(raw?.roofs)) return raw.roofs;
  return [];
};

const getSeekerCompany = () => {
  try {
    const stored = localStorage.getItem('vyomacre_user');
    if (stored) {
      const u = JSON.parse(stored);
      return u.company_name || u.full_name || u.name || u.email || 'Rooftop Seeker';
    }
  } catch { /* ignore */ }
  return 'Rooftop Seeker';
};

function StatTile({ icon: Icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-4 transition-all duration-300 hover:border-[#00E585]/30 hover:shadow-[0_0_20px_rgba(0,229,133,0.06)]"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#93A096]/80">
        <Icon size={12} />
        {label}
      </div>
      <div className="vy-head mt-2 text-2xl font-semibold text-[#F4F8F5]">{value ?? '—'}</div>
    </motion.div>
  );
}

export default function SeekerDashboard() {
  const [allRoofs, setAllRoofs] = useState([]);
  const [verifiedRoofs, setVerifiedRoofs] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [sentRoofIds, setSentRoofIds] = useState(new Set());
  const [ownerContacts, setOwnerContacts] = useState({});
  const [justSent, setJustSent] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [allRes, verifiedRes, mineRes] = await Promise.allSettled([
        getFilteredRoofs({}),
        getVerifiedRoofs(),
        getSeekerLeaseRequests(),
      ]);

      setAllRoofs(allRes.status === 'fulfilled' ? pickList(allRes.value) : []);
      setVerifiedRoofs(verifiedRes.status === 'fulfilled' ? pickList(verifiedRes.value) : []);
      const reqs = mineRes.status === 'fulfilled' ? pickList(mineRes.value) : [];
      setMyRequests(reqs);

      const ids = new Set(reqs.map((r) => String(r.roof_id)));
      setSentRoofIds(ids);
    } catch {
      setError('Failed to load data. Is the backend awake? Refresh in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* unlock owner contact for accepted requests — fetched once per roof */
  useEffect(() => {
    const acceptedRoofIds = myRequests
      .filter((r) => isAccepted(r.status) && r.roof_id)
      .map((r) => String(r.roof_id))
      .filter((id) => !ownerContacts[id]);

    if (acceptedRoofIds.length === 0) return;
    let cancelled = false;

    (async () => {
      for (const id of acceptedRoofIds.slice(0, 8)) {
        try {
          const res = await apiClient.get('/api/roofs/' + id);
          const roof = res.data?.data || res.data;
          if (!cancelled && roof) {
            setOwnerContacts((prev) => ({
              ...prev,
              [id]: { name: roof.owner_name || 'Owner', phone: roof.phone_number || '' },
            }));
          }
        } catch { /* contact unlock optional */ }
      }
    })();

    return () => { cancelled = true; };
  }, [myRequests, ownerContacts]);

  const availableRoofs = useMemo(
    () => verifiedRoofs.filter((r) => normalize(r.status) !== 'leased'),
    [verifiedRoofs]
  );

  const stats = useMemo(() => [
    { icon: Layers, label: 'Onboarded roofs', value: allRoofs.length },
    { icon: ShieldCheck, label: 'Verified & available', value: availableRoofs.length },
    { icon: Send, label: 'My requests', value: myRequests.length },
    { icon: Check, label: 'Accepted', value: myRequests.filter((r) => isAccepted(r.status)).length },
  ], [allRoofs, availableRoofs, myRequests]);

  const requestStatusForRoof = useCallback((roofId) => {
    const req = myRequests.find((r) => String(r.roof_id) === String(roofId));
    return req ? normalize(req.status) : null;
  }, [myRequests]);

  const sendRequest = async (roof) => {
    const token = localStorage.getItem('vyomacre_token');
    if (!token) {
      alert('Please log in to send lease requests.');
      return;
    }

    setSendingId(roof.id);
    try {
      await createLeaseRequest({
        roof_id: String(roof.id),
        company_name: getSeekerCompany(),
      });

      setSentRoofIds((prev) => new Set(prev).add(String(roof.id)));
      setJustSent(roof.id);
      setTimeout(() => setJustSent(null), 2500);

      /* refresh my requests so the inbox updates instantly */
      try {
        const res = await getSeekerLeaseRequests();
        const reqs = pickList(res);
        setMyRequests(reqs);
        setSentRoofIds(new Set(reqs.map((r) => String(r.roof_id))));
      } catch { /* keep optimistic state */ }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.detail || 'Request failed';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A08] text-[#E7EFE9]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
`}</style>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-10 lg:px-16">

        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#1C2A22] bg-[#0A1410]/80 px-4 py-1.5">
              <Building2 size={13} className="text-[#00E585]" />
              <span className="text-xs font-medium text-[#93A096]">Seeker · Discover & Lease</span>
            </div>
            <h1 className="vy-head mt-6 text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              Rooftop <span className="text-[#00E585]">marketplace</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#93A096]">
              Verified rooftops available for lease — send a request in one click
              and track every proposal from your inbox.
            </p>
          </div>

          <button
            onClick={loadAll}
            className="inline-flex items-center gap-2 rounded-xl border border-[#24352B] bg-[#0A1410] px-5 py-3 text-sm font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50 hover:text-[#00E585]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex items-center justify-center rounded-2xl border border-[#1C2A22] bg-[#0A1410]/60 py-20">
            <div className="flex items-center gap-3 text-sm text-[#93A096]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1C2A22] border-t-[#00E585]" />
              Loading rooftops…
            </div>
          </div>
        ) : (
          <>
            {/* ============ AVAILABLE ROOFTOPS ============ */}
            <div className="mt-12">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#00E585]" />
                <h2 className="vy-head text-xl font-semibold text-[#F4F8F5]">
                  Available rooftops
                </h2>
                <span className="rounded-full border border-[#1C2A22] bg-[#0A1410] px-2.5 py-0.5 text-[10px] font-semibold text-[#93A096]">
                  {availableRoofs.length}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#93A096]">
                Satellite-verified and listed — one click sends your lease request to the owner.
              </p>

              {availableRoofs.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#1C2A22] px-6 py-14 text-center">
                  <p className="vy-head text-lg font-semibold text-[#C9D6CC]">No verified rooftops available right now.</p>
                  <p className="mt-2 text-sm text-[#93A096]">New verified listings will appear here.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {availableRoofs.map((roof, i) => {
                    const reqStatus = requestStatusForRoof(roof.id);
                    const alreadySent = sentRoofIds.has(String(roof.id));
                    const sent = justSent === roof.id;
                    const area = roof.area_sqft || roof.gee_estimated_area_sqft || roof.estimated_area_sqft;

                    return (
                      <motion.div
                        key={roof.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.4) }}
                        className="group rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-5 transition-all duration-300 hover:border-[#00E585]/25 hover:shadow-[0_16px_44px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#1C2A22] bg-[#071009] transition-colors duration-300 group-hover:border-[#00E585]/40">
                              <Building2 size={16} className="text-[#00E585]" />
                            </div>
                            <div>
                              <h3 className="vy-head text-base font-semibold capitalize text-[#F4F8F5]">
                                {roof.owner_name || 'Owner'}
                              </h3>
                              <p className="text-[11px] text-[#93A096]/70">#{String(roof.id).substring(0, 8)}</p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full border border-[#00E585]/30 bg-[#00E585]/[0.07] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#00E585]">
                            <ShieldCheck size={11} />
                            Verified
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#93A096]">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={12} />
                            <span className="capitalize">{roof.roof_type || '—'}</span> roof
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Ruler size={12} />
                            {area ? area.toLocaleString('en-IN') + ' sq ft' : '—'}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Crosshair size={12} />
                            {Number(roof.latitude).toFixed(3)}, {Number(roof.longitude).toFixed(3)}
                          </span>
                        </div>

                        {/* one-click request */}
                        <div className="mt-5">
                          {sent || alreadySent ? (
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={
                                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ' +
                                  (reqStatus && isAccepted(reqStatus)
                                    ? STATUS_STYLES.accepted
                                    : reqStatus && isRejected(reqStatus)
                                    ? STATUS_STYLES.rejected
                                    : STATUS_STYLES.pending)
                                }
                              >
                                {sent ? 'Sent' : displayStatus(reqStatus)}
                              </span>
                              {(!reqStatus || (!isAccepted(reqStatus) && !isRejected(reqStatus))) && (
                                <span className="text-[11px] text-[#93A096]/70">Request in owner's inbox</span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => sendRequest(roof)}
                              disabled={sendingId === roof.id}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#00E585] px-5 py-2.5 text-sm font-semibold text-[#04160C] shadow-[0_0_18px_rgba(0,229,133,0.18)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(0,229,133,0.32)] disabled:opacity-50"
                            >
                              <Send size={13} />
                              {sendingId === roof.id ? 'Sending…' : 'Send Lease Request'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ============ MY REQUESTS (inbox) ============ */}
            <div className="mt-14">
              <div className="flex items-center gap-2">
                <Inbox size={15} className="text-[#00E585]" />
                <h2 className="vy-head text-xl font-semibold text-[#F4F8F5]">My lease requests</h2>
                <span className="rounded-full border border-[#1C2A22] bg-[#0A1410] px-2.5 py-0.5 text-[10px] font-semibold text-[#93A096]">
                  {myRequests.length}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#93A096]">
                Every proposal you have sent, with live status and owner contact after acceptance.
              </p>

              {myRequests.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#1C2A22] px-6 py-14 text-center">
                  <p className="vy-head text-lg font-semibold text-[#C9D6CC]">No requests sent yet.</p>
                  <p className="mt-2 text-sm text-[#93A096]">Pick a rooftop above and send your first lease request.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {myRequests.map((req, i) => {
                    const st = normalize(req.status);
                    const pill = STATUS_STYLES[st] || STATUS_STYLES.pending;
                    const contact = ownerContacts[String(req.roof_id)];

                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.4) }}
                        className="rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-5 transition-all duration-300 hover:border-[#00E585]/25"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="vy-head text-base font-semibold text-[#F4F8F5]">
                              Roof #{String(req.roof_id).substring(0, 8)}
                            </h3>
                            <p className="mt-0.5 text-[11px] text-[#93A096]/70">
                              {req.company_name || 'Your company'} · {fmtDate(req.created_at)}
                            </p>
                          </div>
                          <span className={'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ' + pill}>
                            {isAccepted(st) && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                            {displayStatus(st)}
                          </span>
                        </div>

                        {isAccepted(st) ? (
                          contact ? (
                            <div className="mt-4 rounded-xl border border-[#00E585]/25 bg-[#00E585]/[0.06] p-4">
                              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00E585]">
                                <Phone size={11} />
                                Owner contact unlocked
                              </div>
                              <div className="mt-2.5 space-y-1.5 text-sm">
                                <p className="flex items-center gap-2 text-[#E7EFE9]">
                                  <User size={13} className="text-[#93A096]" />
                                  {contact.name}
                                </p>
                                {contact.phone && (
                                  <p className="flex items-center gap-2 text-[#E7EFE9]">
                                    <Phone size={13} className="text-[#93A096]" />
                                    +91 {String(contact.phone).replace(/^\+?91/, '').trim()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#182420] bg-[#071009] px-4 py-3 text-sm text-[#00E585]/80">
                              <Clock size={13} />
                              Accepted — unlocking owner contact…
                            </div>
                          )
                        ) : isRejected(st) ? (
                          <div className="mt-4 rounded-xl border border-[#182420] bg-[#071009] px-4 py-3 text-sm text-[#93A096]">
                            The owner declined this proposal. You can explore other rooftops above.
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#182420] bg-[#071009] px-4 py-3 text-sm text-[#93A096]">
                            <Clock size={13} />
                            Owner contact details unlock automatically once they accept.
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
