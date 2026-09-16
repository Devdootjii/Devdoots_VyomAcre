import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  getVerifiedRoofs,
  getScannedZones,
  createLeaseRequest,
} from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [scannedZones, setScannedZones] = useState([]);
  const [minArea, setMinArea] = useState(0);
  const [roofType, setRoofType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [radarActive, setRadarActive] = useState(true);
  const [leaseSubmitting, setLeaseSubmitting] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchLiveEngineData = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const [roofsRes, zonesRes] = await Promise.allSettled([
          getVerifiedRoofs(),
          getScannedZones(),
        ]);

        if (roofsRes.status === 'fulfilled' && roofsRes.value?.data) {
          const list = Array.isArray(roofsRes.value.data)
            ? roofsRes.value.data
            : roofsRes.value.data.data || [];

          setProperties(list);
        } else {
          setProperties([]);
        }

        if (zonesRes.status === 'fulfilled' && zonesRes.value?.data) {
          const zones = Array.isArray(zonesRes.value.data)
            ? zonesRes.value.data
            : zonesRes.value.data.data || [];

          setScannedZones(zones);
        } else {
          setScannedZones([]);
        }
      } catch (err) {
        console.error('Failed fetching live backend data:', err);
        setErrorMsg('Live backend connecting or no verified records yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveEngineData();
  }, []);

  const filteredListings = properties.filter((item) => {
    const areaMatch =
      Number(item.area_sqft || 0) >= Number(minArea || 0);

    const itemType = (
      item.roof_type ||
      item.property_type ||
      ''
    ).toLowerCase();

    const typeMatch =
      roofType === 'ALL' ||
      itemType === roofType.toLowerCase();

    return areaMatch && typeMatch;
  });

  const handleLeaseRequest = async (roofId, ownerName) => {
    setLeaseSubmitting(roofId);

    try {
      const payload = {
        roof_id: String(roofId),
        company_name: 'SolarCorp B2B',
      };

      const res = await createLeaseRequest(payload);

      const successMessage =
        `Success: Lease request created for ${ownerName}! ` +
        `(Status: ${res.status})`;

      alert(successMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error';

      alert(`Error submitting lease request: ${errorMessage}`);
    } finally {
      setLeaseSubmitting(null);
    }
  };

  return (
    <div className="relative flex h-[720px] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#020706] font-sans text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      {/* Ambient Dashboard Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 z-30 h-72 w-72 rounded-full bg-[#00FF87]/[0.025] blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 z-30 h-80 w-80 rounded-full bg-[#00FF87]/[0.02] blur-[120px]"
      />

      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <div className="relative z-40 shrink-0 border-b border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand / Status */}
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-semibold tracking-[-0.04em]">
                <span className="text-white">Vyom</span>
                <span className="text-[#00FF87]">Acre</span>
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00FF87]/15 bg-[#00FF87]/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#00FF87]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.7)]" />
                Live Production
              </span>
            </div>

            <p className="mt-1 text-[10px] text-slate-600">
              Connected: Render Cloud API
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-2.5">
            {/* Radar */}
            <button
              type="button"
              onClick={() => setRadarActive(!radarActive)}
              className={`h-10 rounded-xl border px-3 text-[10px] font-semibold uppercase tracking-[0.1em] outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00FF87]/25 ${
                radarActive
                  ? 'border-[#00FF87]/20 bg-[#00FF87] text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.05]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    radarActive
                      ? 'bg-[#020706]'
                      : 'bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.6)]'
                  }`}
                />
                {radarActive ? 'Radar: Active' : 'Radar: Off'}
              </span>
            </button>

            {/* Min Area */}
            <div className="flex flex-col">
              <label
                htmlFor="map-min-area"
                className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600"
              >
                Min Area (sq ft)
              </label>

              <input
                id="map-min-area"
                type="number"
                min="0"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="h-10 w-24 rounded-xl border border-white/10 bg-[#030A08] px-3 font-mono text-xs text-white outline-none transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10"
              />
            </div>

            {/* Roof Type */}
            <div className="flex flex-col">
              <label
                htmlFor="map-roof-type"
                className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600"
              >
                Roof Type
              </label>

              <div className="relative">
                <select
                  id="map-roof-type"
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value)}
                  className="h-10 appearance-none rounded-xl border border-white/10 bg-[#030A08] pl-3 pr-8 text-xs text-white outline-none transition-all duration-200 hover:border-white/15 focus:border-[#00FF87]/50 focus:ring-2 focus:ring-[#00FF87]/10"
                >
                  <option value="ALL" className="bg-[#030A08]">
                    All Types
                  </option>
                  <option value="flat" className="bg-[#030A08]">
                    Flat
                  </option>
                  <option value="sloped" className="bg-[#030A08]">
                    Sloped
                  </option>
                  <option value="tin" className="bg-[#030A08]">
                    Tin
                  </option>
                  <option value="concrete" className="bg-[#030A08]">
                    Concrete
                  </option>
                  <option value="other" className="bg-[#030A08]">
                    Other
                  </option>
                </select>

                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="m7 10 5 5 5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAP + SIDEBAR
      ========================================================= */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ================= MAP ================= */}
        <div className="relative h-full min-w-0 flex-1 overflow-hidden bg-[#03100C]">
          {/* Map Ambient HUD Layers */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[400] border-r border-white/[0.03]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[400] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00FF87]/[0.055]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[400] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00FF87]/[0.08]"
          />

          {/* Live Radar Sweep */}
          {radarActive && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-[401] h-64 w-64 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
            >
              <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left -rotate-45 bg-gradient-to-br from-[#00FF87]/[0.08] to-transparent blur-sm" />
            </div>
          )}

          <MapContainer
            center={[26.8467, 80.9462]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {radarActive &&
              scannedZones.map((zone) => {
                if (
                  zone.north &&
                  zone.south &&
                  zone.east &&
                  zone.west
                ) {
                  const bounds = [
                    [Number(zone.south), Number(zone.west)],
                    [Number(zone.north), Number(zone.east)],
                  ];

                  const isScanned =
                    String(zone.status || '').toLowerCase() === 'scanned';

                  return (
                    <Rectangle
                      key={zone.grid_id}
                      bounds={bounds}
                      pathOptions={{
                        color: isScanned
                          ? '#64748b'
                          : '#10b981',
                        fillColor: isScanned
                          ? '#475569'
                          : '#10b981',
                        fillOpacity: isScanned ? 0.45 : 0.2,
                        weight: 1.5,
                        dashArray: isScanned ? '4' : undefined,
                      }}
                    >
                      <Popup>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">
                            Grid: {zone.grid_id}
                          </p>

                          <p className="text-slate-600">
                            Status:{' '}
                            <span className="font-semibold uppercase">
                              {zone.status}
                            </span>
                          </p>

                          {zone.gee_estimated_area_sqft && (
                            <p className="text-slate-600">
                              Area: {zone.gee_estimated_area_sqft} sq ft
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Rectangle>
                  );
                }

                return null;
              })}

            {filteredListings.map((property) => {
              const latitude = Number(property.latitude);
              const longitude = Number(property.longitude);

              if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude)
              ) {
                return (
                  <Marker
                    key={property.id}
                    position={[latitude, longitude]}
                  >
                    <Popup>
                      <div className="font-sans text-xs">
                        <strong className="text-sm text-slate-900">
                          {property.owner_name || 'Verified Roof'}
                        </strong>

                        <p className="mt-1 text-slate-600">
                          Area: {property.area_sqft || 0} sq ft
                        </p>

                        <p className="text-slate-600">
                          Roof:{' '}
                          <span className="capitalize">
                            {property.roof_type || 'Unknown'}
                          </span>
                        </p>

                        <span className="mt-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-green-700">
                          {property.verification_status ||
                            property.status ||
                            'Verified'}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              }

              return null;
            })}
          </MapContainer>

          {/* Map HUD Badge */}
          <div className="absolute left-4 top-4 z-[500] rounded-2xl border border-white/10 bg-[#020706]/75 px-3.5 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-[#00FF87]/20 bg-[#00FF87]/[0.045]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.7)]" />
              </div>

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-600">
                  Spatial Intelligence
                </p>

                <p className="mt-0.5 text-[10px] text-slate-300">
                  {filteredListings.length} active opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Map Bottom Meta */}
          <div className="absolute bottom-4 left-4 z-[500] flex items-center gap-3 rounded-full border border-white/10 bg-[#020706]/75 px-3 py-2 backdrop-blur-xl">
            <span className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.15em] text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_7px_rgba(0,255,135,0.6)]" />
              Verified
            </span>

            <span className="h-3 w-px bg-white/10" />

            <span className="text-[8px] font-medium uppercase tracking-[0.15em] text-slate-600">
              Radar {radarActive ? 'On' : 'Off'}
            </span>
          </div>
        </div>

        {/* ================= SIDEBAR ================= */}
        <aside className="relative flex w-[310px] shrink-0 flex-col border-l border-white/10 bg-[#020706]/95 backdrop-blur-2xl xl:w-80">
          {/* Sidebar Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-90px] top-[15%] h-64 w-64 rounded-full bg-[#00FF87]/[0.025] blur-[100px]"
          />

          {/* Sidebar Header */}
          <div className="relative z-10 shrink-0 border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Property Index
                </span>

                <p className="mt-1 text-sm font-medium tracking-[-0.02em] text-white">
                  Verified Roofs
                </p>
              </div>

              <span className="rounded-full border border-[#00FF87]/15 bg-[#00FF87]/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#00FF87]">
                {filteredListings.length} Live
              </span>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="relative flex h-7 w-7 items-center justify-center">
                  <span className="absolute h-7 w-7 animate-spin rounded-full border border-white/10 border-t-[#00FF87]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.7)]" />
                </span>

                <p className="mt-4 text-[10px] uppercase tracking-[0.13em] text-slate-600">
                  Connecting to live cloud engine...
                </p>
              </div>
            ) : errorMsg ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.045] p-4 text-center">
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/[0.05] text-xs text-amber-300">
                  !
                </span>

                <p className="mt-3 text-[10px] leading-5 text-amber-300">
                  {errorMsg}
                </p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.025]">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="11" cy="11" r="6" />
                    <path d="m16 16 4 4" strokeLinecap="round" />
                  </svg>
                </div>

                <p className="mt-4 text-xs font-medium text-slate-400">
                  No verified roofs listed in database yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredListings.map((property) => (
                  <div
                    key={property.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur-md transition-all duration-300 hover:border-[#00FF87]/25 hover:bg-white/[0.04]"
                  >
                    {/* Hover Accent */}
                    <div
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full w-px bg-[#00FF87] opacity-0 shadow-[0_0_10px_rgba(0,255,135,0.55)] transition-opacity duration-300 group-hover:opacity-70"
                    />

                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[9px] tracking-[0.08em] text-slate-600">
                        #{String(property.id).substring(0, 8)}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00FF87]/15 bg-[#00FF87]/[0.04] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#00FF87]">
                        <span className="h-1 w-1 rounded-full bg-[#00FF87] shadow-[0_0_5px_rgba(0,255,135,0.7)]" />
                        {property.verification_status || 'Verified'}
                      </span>
                    </div>

                    <h4 className="mt-4 truncate text-sm font-medium tracking-[-0.015em] text-white">
                      {property.owner_name || 'Unnamed Owner'}
                    </h4>

                    <div className="mt-2 space-y-1">
                      <p className="text-[11px] text-slate-500">
                        Type:{' '}
                        <span className="capitalize text-slate-300">
                          {property.roof_type || 'Unknown'}
                        </span>
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Area:{' '}
                        <span className="font-semibold text-[#00FF87]">
                          {property.area_sqft || 0} sq ft
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleLeaseRequest(
                          property.id,
                          property.owner_name || 'property owner'
                        )
                      }
                      disabled={leaseSubmitting === property.id}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF87] px-3 py-2 text-xs font-semibold text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.25)] transition-all duration-300 hover:shadow-[0_0_22px_rgba(0,255,135,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      {leaseSubmitting === property.id ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#020706]/20 border-t-[#020706]" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Lease Request

                          <svg
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="relative z-10 shrink-0 border-t border-white/10 bg-[#020706]/90 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                DATA SOURCE
              </span>

              <span className="font-mono text-[8px] text-slate-600">
                RENDER / API
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapDashboard;