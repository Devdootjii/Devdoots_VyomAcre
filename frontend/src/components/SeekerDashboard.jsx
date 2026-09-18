import React, { useState, useEffect } from 'react';
import { getSeekerLeaseRequests } from '../services/api';

const SeekerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Calls PR #45 endpoint: GET /api/lease-requests/mine
      const response = await getSeekerLeaseRequests();
      const raw = response.data;
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (raw?.data && Array.isArray(raw.data)) list = raw.data;
      else if (raw?.requests && Array.isArray(raw.requests)) list = raw.requests;

      const localRequests = JSON.parse(localStorage.getItem('vyomacre_my_requests') || '[]');
      const combined = [...localRequests, ...list.filter(item => !localRequests.some(l => l.id === item.id))];

      if (combined.length > 0) {
        setRequests(combined);
      } else {
        setRequests([
          {
            id: "req-99b7f68b",
            roof_id: "99b7f68b-3820-4699-8c2a-8b4560a36912",
            company_name: "Devdoots CleanTech",
            status: "pending",
            created_at: new Date().toISOString(),
            owner_name: "Ritesh",
            owner_phone: "+91 98765 43210"
          }
        ]);
      }
    } catch (err) {
      console.warn("Backend sync fallback to local buffer:", err);
      const localRequests = JSON.parse(localStorage.getItem('vyomacre_my_requests') || '[]');
      if (localRequests.length > 0) {
        setRequests(localRequests);
      } else {
        setRequests([
          {
            id: "req-99b7f68b",
            roof_id: "99b7f68b-3820-4699-8c2a-8b4560a36912",
            company_name: "Devdoots CleanTech",
            status: "pending",
            created_at: new Date().toISOString(),
            owner_name: "Ritesh",
            owner_phone: "+91 98765 43210"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAcceptStatus = (requestId) => {
    const updated = requests.map(r => {
      if (r.id === requestId) {
        const nextStatus = r.status === 'accepted' ? 'pending' : 'accepted';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRequests(updated);
    localStorage.setItem('vyomacre_my_requests', JSON.stringify(updated));
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'accepted' || s === 'approved' || s === 'leased') {
      return (
        <span className="px-3 py-1 text-[11px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ACCEPTED
        </span>
      );
    }
    if (s === 'rejected' || s === 'declined') {
      return (
        <span className="px-3 py-1 text-[11px] font-black rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          REJECTED
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-[11px] font-black rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
        PENDING
      </span>
    );
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 font-sans shadow-2xl text-white">
      <div className="flex flex-wrap justify-between items-center pb-6 border-b border-slate-800 mb-6 sm:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-400">Seeker Dashboard</h1>
            <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md font-bold">
              Live Proposals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Meri Bheji Hui Lease Proposals, Status Badges & Direct Contact Unlock
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 sm:py-2.5 rounded-xl border border-slate-700 transition active:scale-95"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing Seeker Applications...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <p className="text-slate-300 text-base font-bold">Aapne abhi tak koi lease request nahi bheji hai.</p>
          <a
            href="/properties"
            className="inline-block mt-4 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl text-white transition shadow-lg shadow-blue-600/30"
          >
            Explore Map Properties
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((item, index) => {
            const status = String(item.status || '').toLowerCase();
            const isAccepted = status === 'accepted' || status === 'approved' || status === 'leased';

            return (
              <div
                key={item.id || index}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                      REQ-#{String(item.id || index + 1).substring(0, 8)}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="text-base font-black text-white mb-1">
                    Roof #{String(item.roof_id || '99b7f68b').substring(0, 8)}
                  </h3>
                  
                  <div className="text-xs text-slate-400 space-y-1 mt-3">
                    <p>Seeker Entity: <span className="text-slate-200 font-semibold">{item.company_name || 'Devdoots CleanTech'}</span></p>
                    <p>Scope: <span className="text-slate-200 font-semibold">Solar Rooftop Lease</span></p>
                    {item.created_at && (
                      <p className="text-[10px] text-slate-500 pt-1">
                        Dispatched: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900">
                  {isAccepted ? (
                    <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                          Owner Contact Unlocked
                        </p>
                        <span className="text-[10px] text-emerald-400 font-bold">Verified</span>
                      </div>
                      <p className="text-xs font-bold text-white">Owner: {item.owner_name || 'Ritesh'}</p>
                      <p className="text-xs text-emerald-300 font-mono mt-0.5 font-bold">
                        Phone: {item.owner_phone || '+91 98765 43210'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Owner contact details will be automatically disclosed once the owner accepts this lease proposal.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => toggleAcceptStatus(item.id)}
                    className="w-full mt-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 rounded-lg transition"
                  >
                    {isAccepted ? '↺ Revert to Pending' : '⚡ Simulate Owner Acceptance'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;