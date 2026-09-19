import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCw, Building2, Ruler, Crosshair, Satellite, ShieldCheck,
  AlertTriangle, Clock, Plus, Layers, Home, Check, X,
} from 'lucide-react';
import { getOwnerRoofs } from '../services/api';

/* ============================================================
   VyomAcre — Owner Dashboard (property tracker)
   - GET /api/roofs/owner/{phone} → all my rooftops
   - Auto-refresh every 30s + manual refresh
   - FIX: verification status ab verification_status field se aata hai
     (pehle roof.status pehle padha jata tha — hamesha Pending dikhta tha)
   - Do alag pills: Verification (GEE/admin) + Listing (lease lifecycle)
   ============================================================ */

const normalize = (v) => String(v || '').toLowerCase();

const VERIF_STYLES = {
  verified: 'border-[#00E585]/40 bg-[#00E585]/[0.08] text-[#4FFFAB]',
  flagged: 'border-red-500/30 bg-red-500/[0.07] text-red-300',
  verification_failed: 'border-red-500/30 bg-red-500/[0.07] text-red-300',
  pending_verification: 'border-amber-500/30 bg-amber-500/[0.07] text-amber-300',
};

const verifOf = (roof) => {
  const v = normalize(roof?.verification_status);
  if (['verified', 'approved'].includes(v)) return 'verified';
  if (['flagged', 'rejected', 'verification_failed'].includes(v)) return 'flagged';
  return 'pending_verification';
};

const VERIF_LABEL = {
  verified: 'Verified',
  flagged: 'Flagged',
  verification_failed: 'Flagged',
  pending_verification: 'Pending',
};

const listingOf = (roof) => {
  const s = normalize(roof?.status);
  if (s === 'leased') return { label: 'Leased', leased: true };
  if (s === 'approved') return { label: 'Approved', leased: false };
  if (s === 'rejected') return { label: 'Rejected', leased: false };
  return { label: 'Listed', leased: false };
};

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const fmtNum = (n) => (n !== null && n !== undefined && !Number.isNaN(Number(n)) ? Number(n).toLocaleString('en-IN') : '—');

/* ---------- pipeline stage ---------- */
function Stage({ icon: Icon, label, state }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={
          'flex h-8 w-8 items-center justify-center rounded-full border ' +
          (state === 'done'
            ? 'border-[#00E585]/50 bg-[#00E585]/[0.12] text-[#00E585]'
            : state === 'current'
            ? 'border-amber-400/50 bg-amber-400/10 text-amber-300'
            : 'border-[#1C2A22] bg-[#071009] text-[#93A096]/50')
        }
      >
        {state === 'done' ? <Check size={13} /> : state === 'current' ? <Clock size={13} /> : <Icon size={13} />}
      </div>
      <div>
        <p className={'text-xs font-semibold ' + (state === 'todo' ? 'text-[#93A096]/50' : 'text-[#E7EFE9]')}>{label}</p>
        {state === 'current' && <p className="text-[10px] text-amber-300/80">in progress</p>}
      </div>
    </div>
  );
}

export default function OwnerStatusDashboard() {
  const [roofs, setRoofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getPhone = () => {
    try {
      const owner = localStorage.getItem('vyomacre_owner');
      if (owner) {
        const o = JSON.parse(owner);
        if (o?.phone_number) return o.phone_number;
        if (o?.phone) return o.phone;
      }
    } catch { /* ignore */ }
    try {
      const user = localStorage.getItem('vyomacre_user');
      if (user) {
        const u = JSON.parse(user);
        if (u?.phone_number) return u.phone_number;
        if (u?.phone) return u.phone;
      }
    } catch { /* ignore */ }
    return '';
  };

  const fetchRoofs = useCallback(async () => {
    const phoneNumber = getPhone();
    if (!phoneNumber) {
      setRoofs([]);
      setError('Owner information not found. Please login again.');
      setLoading(false);
      return;
    }
    try {
      setError('');
      const response = await getOwnerRoofs(phoneNumber);
      const data = response?.data?.data || response?.data?.roofs || response?.data || [];
      setRoofs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch owner roofs:', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Unable to load your property listings.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoofs();
    const interval = setInterval(fetchRoofs, 30000);
    return () => clearInterval(interval);
  }, [fetchRoofs]);

  const stats = useMemo(() => {
    let verified = 0, pending = 0, leased = 0;
    for (const r of roofs) {
      const v = verifOf(r);
      if (v === 'verified') verified++;
      else if (v === 'pending_verification') pending++;
      if (listingOf(r).leased) leased++;
    }
    return [
      { icon: Layers, label: 'My rooftops', value: roofs.length },
      { icon: ShieldCheck, label: 'Verified', value: verified },
      { icon: Clock, label: 'Pending', value: pending },
      { icon: Home, label: 'Leased', value: leased },
    ];
  }, [roofs]);

  return (
    <div className="min-h-screen bg-[#050A08] text-[#E7EFE9]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
`}</style>

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-28 sm:px-10 lg:px-14">

        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#1C2A22] bg-[#0A1410]/80 px-4 py-1.5">
              <Satellite size={13} className="text-[#00E585]" />
              <span className="text-xs font-medium text-[#93A096]">Owner · Property tracker</span>
            </div>
            <h1 className="vy-head mt-6 text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              Your <span className="text-[#00E585]">rooftops</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#93A096]">
              Track every listing with its satellite verification and lease status.
              Updates automatically every 30 seconds.
            </p>
          </div>

          <button
            onClick={fetchRoofs}
            className="inline-flex items-center gap-2 rounded-xl border border-[#24352B] bg-[#0A1410] px-5 py-3 text-sm font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50 hover:text-[#00E585]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-4 transition-all duration-300 hover:border-[#00E585]/30"
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#93A096]/80">
                <s.icon size={12} />
                {s.label}
              </div>
              <div className="vy-head mt-2 text-2xl font-semibold text-[#F4F8F5]">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* content */}
        {loading ? (
          <div className="mt-10 flex items-center justify-center rounded-2xl border border-[#1C2A22] bg-[#0A1410]/60 py-20">
            <div className="flex items-center gap-3 text-sm text-[#93A096]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1C2A22] border-t-[#00E585]" />
              Loading your rooftops…
            </div>
          </div>
        ) : roofs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
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
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#1C2A22]" style={{ animation: 'vyorot 10s linear infinite' }}>
                <span className="absolute left-1/2 top-[-4px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#00E585] shadow-[0_0_12px_rgba(0,229,133,0.8)]" />
              </div>
              <div className="absolute inset-5 rounded-full border border-[#00E585]/20" style={{ animation: 'vyorot 7s linear infinite reverse' }}>
                <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#00E585]/70" />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E585]/25 bg-[#071009]">
                <Satellite size={18} className="text-[#00E585]" />
              </div>
            </div>
            <style>{`@keyframes vyorot { to { transform: rotate(360deg); } }`}</style>

            <h2 className="vy-head mt-8 text-2xl font-semibold">No rooftops listed yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#93A096]">
              Add your first rooftop and watch the satellite engine verify it on the map.
            </p>
            <Link
              to="/owner/new-roof"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#00E585] px-6 py-3 text-sm font-semibold text-[#04160C] shadow-[0_0_24px_rgba(0,229,133,0.25)] transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus size={15} />
              List your roof
            </Link>
          </motion.div>
        ) : (
          <div className="mt-10 space-y-5">
            {roofs.map((roof, i) => {
              const v = verifOf(roof);
              const listing = listingOf(roof);
              const area = roof.area_sqft ?? roof.estimated_area_sqft ?? roof.gee_estimated_area_sqft;
              const gee = roof.gee_estimated_area_sqft;

              return (
                <motion.article
                  key={roof.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.4) }}
                  className="group rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-5 transition-all duration-300 hover:border-[#00E585]/25 hover:shadow-[0_16px_44px_rgba(0,0,0,0.3)] sm:p-6"
                >
                  {/* head */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-[#1C2A22] bg-[#071009] transition-colors duration-300 group-hover:border-[#00E585]/40">
                        <Building2 size={17} className="text-[#00E585]" />
                      </div>
                      <div>
                        <h3 className="vy-head text-lg font-semibold capitalize text-[#F4F8F5]">
                          {roof.owner_name || 'My rooftop'}
                        </h3>
                        <p className="text-[11px] text-[#93A096]/70">
                          #{String(roof.id).substring(0, 8)} · listed {fmtDate(roof.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ' + (VERIF_STYLES[v] || VERIF_STYLES.pending_verification)}>
                        {v === 'verified' ? <ShieldCheck size={11} /> : v === 'flagged' ? <AlertTriangle size={11} /> : <Clock size={11} />}
                        {VERIF_LABEL[v]}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1C2A22] bg-[#071009] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#93A096]">
                        {listing.leased ? <Check size={11} className="text-[#00E585]" /> : listing.label === 'Rejected' ? <X size={11} /> : null}
                        {listing.label}
                      </span>
                    </div>
                  </div>

                  {/* pipeline */}
                  <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-[#182420] bg-[#071009] px-4 py-3.5">
                    <Stage icon={Clock} label="Submitted" state="done" />
                    <span aria-hidden="true" className="hidden h-px w-8 bg-[#1C2A22] sm:block" />
                    <Stage icon={Satellite} label="Satellite verified" state={v === 'verified' ? 'done' : v === 'flagged' ? 'todo' : 'current'} />
                    <span aria-hidden="true" className="hidden h-px w-8 bg-[#1C2A22] sm:block" />
                    <Stage icon={Home} label="Leased" state={listing.leased ? 'done' : v === 'verified' ? 'current' : 'todo'} />
                  </div>

                  {/* details */}
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
                      <Building2 size={12} className="flex-none text-[#93A096]" />
                      <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Type</span>
                      <span className="ml-auto text-xs font-medium capitalize text-[#E7EFE9]">{roof.roof_type || '—'}</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
                      <Ruler size={12} className="flex-none text-[#93A096]" />
                      <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Area</span>
                      <span className="ml-auto text-xs font-medium text-[#E7EFE9]">
                        {area ? fmtNum(area) + ' sq ft' : '—'}
                      </span>
                    </div>

                    {gee != null && (
                      <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
                        <Satellite size={12} className="flex-none text-[#00E585]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Satellite estimate</span>
                        <span className="ml-auto text-xs font-medium text-[#00E585]/80">{fmtNum(gee)} sq ft</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
                      <Crosshair size={12} className="flex-none text-[#93A096]" />
                      <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Location</span>
                      <span className="ml-auto text-xs font-medium text-[#E7EFE9]">
                        {Number(roof.latitude).toFixed(3)}, {Number(roof.longitude).toFixed(3)}
                      </span>
                    </div>

                    {roof.verification_message && (
                      <div className="rounded-lg border border-[#182420] bg-[#071009] px-3 py-2.5 sm:col-span-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#93A096]/70">
                          <Satellite size={12} />
                          Satellite message
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[#C9D6CC]">{roof.verification_message}</p>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
