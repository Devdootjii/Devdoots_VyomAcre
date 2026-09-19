import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Check, Flag, ShieldCheck, Search, Building2, Users,
  Layers, Clock, MapPin, Ruler, Phone, Calendar, Crosshair, User,
} from 'lucide-react';
import apiClient from '../services/api';

/* ============================================================
   VyomAcre — Admin Panel (mission control, full data)
   - GET  /api/admin/stats  → all counters
   - GET  /api/admin/roofs  → every roof with full details
   - PATCH /api/roofs/{id}/verify | /reject
   Admin only (ProtectedRoute gated).
   ============================================================ */

const FILTERS = [
  { key: 'all', label: 'All roofs' },
  { key: 'pending_verification', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'flagged', label: 'Flagged' },
];

const STATUS_STYLES = {
  pending_verification: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  verified: 'border-[#00E585]/30 bg-[#00E585]/10 text-[#00E585]',
  flagged: 'border-red-400/30 bg-red-400/10 text-red-300',
};

const STATUS_LABELS = {
  pending_verification: 'Pending',
  verified: 'Verified',
  flagged: 'Flagged',
};

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const fmtCoord = (v) => (v !== null && v !== undefined && !Number.isNaN(Number(v)) ? Number(v).toFixed(4) : '—');

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

function RoofCard({ roof, busy, onAct }) {
  const vs = String(roof.verification_status || 'pending_verification');
  const pill = STATUS_STYLES[vs] || STATUS_STYLES.pending_verification;
  const isLeased = String(roof.status || '').toLowerCase() === 'leased';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-5 transition-all duration-300 hover:border-[#00E585]/25 hover:shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
    >
      {/* head */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#1C2A22] bg-[#071009] transition-colors duration-300 group-hover:border-[#00E585]/40">
            <User size={16} className="text-[#00E585]" />
          </div>
          <div>
            <h3 className="vy-head text-base font-semibold capitalize text-[#F4F8F5]">
              {roof.owner_name || 'Owner'}
            </h3>
            <p className="text-[11px] text-[#93A096]/70">#{String(roof.id).substring(0, 8)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLeased && (
            <span className="rounded-full border border-[#00E585]/30 bg-[#00E585]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#00E585]">
              Leased
            </span>
          )}
          <span className={'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ' + pill}>
            {STATUS_LABELS[vs] || 'Pending'}
          </span>
        </div>
      </div>

      {/* full details grid */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
          <Phone size={12} className="flex-none text-[#93A096]" />
          <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Phone</span>
          <span className="ml-auto text-xs font-medium text-[#E7EFE9]">{roof.phone_number || '—'}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
          <Building2 size={12} className="flex-none text-[#93A096]" />
          <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Type</span>
          <span className="ml-auto text-xs font-medium capitalize text-[#E7EFE9]">{roof.roof_type || '—'}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
          <Ruler size={12} className="flex-none text-[#93A096]" />
          <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Area</span>
          <span className="ml-auto text-xs font-medium text-[#E7EFE9]">
            {roof.area_sqft ? roof.area_sqft.toLocaleString('en-IN') + ' sq ft' : '—'}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
          <Layers size={12} className="flex-none text-[#93A096]" />
          <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">GEE Estimate</span>
          <span className="ml-auto text-xs font-medium text-[#00E585]/80">
            {roof.gee_estimated_area_sqft
              ? roof.gee_estimated_area_sqft.toLocaleString('en-IN') + ' sq ft'
              : 'Not scanned'}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
          <Crosshair size={12} className="flex-none text-[#93A096]" />
          <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Location</span>
          <span className="ml-auto text-xs font-medium text-[#E7EFE9]">
            {fmtCoord(roof.latitude)}, {fmtCoord(roof.longitude)}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#182420] bg-[#071009] px-3 py-2">
          <Calendar size={12} className="flex-none text-[#93A096]" />
          <span className="text-[10px] uppercase tracking-wider text-[#93A096]/70">Listed</span>
          <span className="ml-auto text-xs font-medium text-[#E7EFE9]">{fmtDate(roof.created_at)}</span>
        </div>

        {roof.verification_message && (
          <div className="rounded-lg border border-[#182420] bg-[#071009] px-3 py-2 sm:col-span-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#93A096]/70">
              <MapPin size={12} />
              Verification message
            </div>
            <p className="mt-1 text-xs leading-5 text-[#C9D6CC]">{roof.verification_message}</p>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {vs !== 'verified' && (
          <button
            onClick={() => onAct(roof.id, 'verify')}
            disabled={busy === roof.id + 'verify'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00E585] px-4 py-2 text-xs font-semibold text-[#04160C] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,133,0.3)] disabled:opacity-50"
          >
            <Check size={13} />
            {busy === roof.id + 'verify' ? 'Verifying…' : 'Verify'}
          </button>
        )}
        {vs !== 'flagged' && (
          <button
            onClick={() => onAct(roof.id, 'reject')}
            disabled={busy === roof.id + 'reject'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-300 transition-all duration-300 hover:bg-red-500/[0.08] disabled:opacity-50"
          >
            <Flag size={13} />
            {busy === roof.id + 'reject' ? 'Flagging…' : 'Flag'}
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [roofs, setRoofs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/admin/stats');
      setStats(res.data?.data || null);
    } catch {
      /* stats optional — main list still loads */
    }
  }, []);

  const loadRoofs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await apiClient.get('/api/admin/roofs', { params });
      setRoofs(res.data?.data || []);
    } catch (e) {
      setError(
        e?.response?.status === 403
          ? 'Admin access required for this page. Log in with an admin account.'
          : 'Failed to load roofs. Is the backend awake? Refresh in a moment.'
      );
      setRoofs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadRoofs(); }, [loadRoofs]);

  const act = async (id, action) => {
    setBusyId(id + action);
    try {
      await apiClient.patch(`/api/roofs/${id}/${action}`);
      await Promise.all([loadRoofs(), loadStats()]);
    } catch {
      setError('Action failed — please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const visibleRoofs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roofs;
    return roofs.filter(
      (r) =>
        String(r.owner_name || '').toLowerCase().includes(q) ||
        String(r.phone_number || '').includes(q) ||
        String(r.roof_type || '').toLowerCase().includes(q) ||
        String(r.id).toLowerCase().includes(q)
    );
  }, [roofs, query]);

  const statItems = stats
    ? [
        { icon: Layers, label: 'Total roofs', value: stats.total_roofs },
        { icon: Clock, label: 'Pending', value: stats.pending },
        { icon: ShieldCheck, label: 'Verified', value: stats.verified },
        { icon: Building2, label: 'Leased', value: stats.leased },
        { icon: Users, label: 'Users', value: stats.total_users },
        { icon: RefreshCw, label: 'Lease requests', value: stats.total_leases },
      ]
    : [];

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
              <ShieldCheck size={13} className="text-[#00E585]" />
              <span className="text-xs font-medium text-[#93A096]">Admin · Mission control</span>
            </div>
            <h1 className="vy-head mt-6 text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              All rooftops, <span className="text-[#00E585]">full detail</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#93A096]">
              Every listing with owner, area, GEE estimate, coordinates and status —
              verify or flag in one click.
            </p>
          </div>

          <button
            onClick={() => { loadRoofs(); loadStats(); }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#24352B] bg-[#0A1410] px-5 py-3 text-sm font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50 hover:text-[#00E585]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statItems.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>

        {/* error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* controls */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    'rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ' +
                    (active
                      ? 'border-[#00E585]/50 bg-[#00E585]/[0.1] text-[#00E585] shadow-[0_0_14px_rgba(0,229,133,0.12)]'
                      : 'border-[#1C2A22] bg-[#0A1410] text-[#93A096] hover:border-[#00E585]/25 hover:text-[#C9D6CC]')
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93A096]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search owner, phone, type…"
              className="w-full rounded-xl border border-[#1C2A22] bg-[#0A1410] py-2.5 pl-10 pr-4 text-sm text-[#F4F8F5] outline-none transition-all duration-300 placeholder:text-[#5E6B62] focus:border-[#00E585]/50"
            />
          </div>
        </div>

        {/* roof cards */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-[#1C2A22] bg-[#0A1410]/60 py-20">
              <div className="flex items-center gap-3 text-sm text-[#93A096]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1C2A22] border-t-[#00E585]" />
                Loading rooftops…
              </div>
            </div>
          ) : visibleRoofs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1C2A22] px-6 py-16 text-center">
              <p className="vy-head text-lg font-semibold text-[#C9D6CC]">
                {query ? 'No matches for your search.' : 'No rooftops in this filter.'}
              </p>
              <p className="mt-2 text-sm text-[#93A096]">
                {query ? 'Try a different name, phone or roof type.' : 'New submissions will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleRoofs.map((roof) => (
                <RoofCard key={roof.id} roof={roof} busy={busyId} onAct={act} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
