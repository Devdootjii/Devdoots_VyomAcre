import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Satellite, Crosshair, RotateCcw, ShieldCheck, Radio } from 'lucide-react';
import { getFilteredRoofs, getVerifiedRoofs, getScannedZones, createLeaseRequest } from '../services/api';

/* ============================================================
   VyomAcre — Live Properties Map (dark edition)
   - CARTO dark tiles (no more white map)
   - Green radar pins (verified) / red (flagged) / amber (pending)
   - Dark popups + zoom controls via CSS override
   - Same logic: filters, zones, lease requests, geolocation
   ============================================================ */

// Accurate status resolver: Prioritizes manual approval over automated flags
const getPropertyStatus = (prop) => {
  const s = String(prop.status || '').toLowerCase();
  const vs = String(prop.verification_status || '').toLowerCase();

  if (s === 'approved' || vs === 'approved' || s === 'verified' || vs === 'verified' || prop.is_verified === true) {
    return 'approved';
  }
  if (s === 'flagged' || vs === 'flagged' || s === 'rejected' || vs === 'rejected' || vs.includes('fail')) {
    return 'flagged';
  }
  return 'pending';
};

// Radar Scanning Pins (Green = Verified, Red = Flagged, Amber = Pending)
const createStatusPin = (status) => {
  let pinColor = '#eab308'; // Default Pending: Amber
  if (status === 'approved') pinColor = '#00E585'; // Verified: VyomAcre Green
  if (status === 'flagged') pinColor = '#ef4444'; // Flagged: Red

  return L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${pinColor}; background-color: ${pinColor}; opacity: 0.35; animation: radarPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;"></div>
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${pinColor}; background-color: ${pinColor}; opacity: 0.35; animation: radarPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 0.75s;"></div>
        <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: ${pinColor}; border: 2.5px solid #050A08; box-shadow: 0 0 12px ${pinColor}; animation: coreGlow 2s ease-in-out infinite;"></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });
};

const LocationController = ({ userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) map.flyTo(userLocation, 13);
  }, [userLocation, map]);
  return null;
};

// Pulsing white-green dot for the user's live location
const createUserPin = () => {
  return L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #F4F8F5; opacity: 0.3; animation: radarPulse 1.6s ease-out infinite;"></div>
        <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background: #F4F8F5; border: 2.5px solid #00E585; box-shadow: 0 0 14px rgba(0,229,133,0.9);"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
};

const SELECT_CLS =
  'bg-[#0A1410] text-[#E7EFE9] text-xs px-2.5 py-1.5 rounded-lg outline-none border border-[#1C2A22] transition-colors focus:border-[#00E585]/50';

const MapDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [scannedZones, setScannedZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filters
  const [filters, setFilters] = useState({ city: 'ALL', roof_type: 'ALL', min_area: '', max_area: '' });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Phase 2: Only Satellite Verified Toggle
  const [onlyVerified, setOnlyVerified] = useState(false);

  const [radarActive, setRadarActive] = useState(true);
  const [leaseSubmitting, setLeaseSubmitting] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [roofsRes, zonesRes] = await Promise.allSettled([
        getFilteredRoofs(filters),
        getScannedZones()
      ]);

      if (roofsRes.status === 'fulfilled' && roofsRes.value?.data) {
        const raw = roofsRes.value.data;
        let list = [];
        if (Array.isArray(raw)) list = raw;
        else if (raw.data && Array.isArray(raw.data.roofs)) list = raw.data.roofs;
        else if (Array.isArray(raw.roofs)) list = raw.roofs;
        else if (Array.isArray(raw.data)) list = raw.data;
        setProperties(list);
      } else {
        const fallbackRes = await getVerifiedRoofs().catch(() => null);
        if (fallbackRes?.data) {
          const raw = fallbackRes.data;
          let list = [];
          if (Array.isArray(raw)) list = raw;
          else if (raw.data && Array.isArray(raw.data.roofs)) list = raw.data.roofs;
          else if (Array.isArray(raw.roofs)) list = raw.roofs;
          else if (Array.isArray(raw.data)) list = raw.data;
          setProperties(list);
        } else {
          setProperties([]);
        }
      }

      if (zonesRes.status === 'fulfilled' && zonesRes.value?.data) {
        const rawZones = zonesRes.value.data;
        let zoneList = [];
        if (Array.isArray(rawZones)) zoneList = rawZones;
        else if (rawZones.data && Array.isArray(rawZones.data.zones)) zoneList = rawZones.data.zones;
        else if (Array.isArray(rawZones.zones)) zoneList = rawZones.zones;
        else if (Array.isArray(rawZones.data)) zoneList = rawZones.data;
        setScannedZones(zoneList);
      } else {
        setScannedZones([]);
      }
    } catch (err) {
      setErrorMsg('Unable to load map properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);

    let count = 0;
    if (updated.city !== 'ALL') count++;
    if (updated.roof_type !== 'ALL') count++;
    if (updated.min_area) count++;
    if (updated.max_area) count++;
    setActiveFilterCount(count);
  };

  const resetFilters = () => {
    setFilters({ city: 'ALL', roof_type: 'ALL', min_area: '', max_area: '' });
    setActiveFilterCount(0);
    setOnlyVerified(false);
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => alert('Location access permission was denied.')
      );
    }
  };

  const handleLeaseRequest = async (roofId, fullOwnerName) => {
    const token = localStorage.getItem('vyomacre_token');

    if (!token) {
      sessionStorage.setItem('redirect_after_login', window.location.pathname);
      alert('Authentication required. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    let seekerCompany = 'Devdoots Solar';
    try {
      const storedUser = localStorage.getItem('vyomacre_user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        seekerCompany = userObj.company_name || userObj.full_name || userObj.email || seekerCompany;
      }
    } catch (e) {
      console.warn('Could not parse user', e);
    }

    setLeaseSubmitting(roofId);
    try {
      const payload = {
        roof_id: String(roofId),
        company_name: seekerCompany
      };

      await createLeaseRequest(payload);
      alert(`Success: Lease request dispatched for ${fullOwnerName?.split(' ')[0] || 'Owner'}'s property!`);
    } catch (error) {
      console.error('Lease Error Response:', error.response?.data);
      const detailMsg = error.response?.data?.message || error.response?.data?.detail || 'Request failed';
      alert(`Error: ${typeof detailMsg === 'string' ? detailMsg : JSON.stringify(detailMsg)}`);
    } finally {
      setLeaseSubmitting(null);
    }
  };

  // Filter properties cleanly using normalized status
  const displayedProperties = properties.filter((prop) => {
    if (!onlyVerified) return true;
    return getPropertyStatus(prop) === 'approved';
  });

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
    <div
      className="relative flex h-[calc(100vh-250px)] min-h-[540px] w-full flex-col overflow-hidden rounded-[1.75rem] border border-[#1C2A22] bg-[#071009] font-sans shadow-2xl"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Keyframes + Leaflet dark overrides */}
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }

@keyframes radarPulse {
  0% { transform: scale(0.6); opacity: 0.9; }
  70% { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.6); opacity: 0; }
}
@keyframes coreGlow {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px currentColor); }
  50% { transform: scale(1.18); filter: drop-shadow(0 0 8px currentColor); }
}
.custom-radar-pin { background: transparent !important; border: none !important; }

.leaflet-container { background: #050A08 !important; }
.leaflet-bar a {
  background: #0A1410 !important;
  color: #93A096 !important;
  border-color: #1C2A22 !important;
}
.leaflet-bar a:hover {
  background: #071009 !important;
  color: #00E585 !important;
}
.leaflet-bar { border: 1px solid #1C2A22 !important; border-radius: 10px !important; overflow: hidden; }
.leaflet-popup-content-wrapper, .leaflet-popup-tip {
  background: #0A1410 !important;
  color: #E7EFE9 !important;
  box-shadow: 0 18px 50px rgba(0,0,0,0.55) !important;
}
.leaflet-popup-content-wrapper {
  border: 1px solid #1C2A22 !important;
  border-radius: 14px !important;
}
.leaflet-popup-close-button { color: #93A096 !important; }
.leaflet-control-attribution {
  background: rgba(5,10,8,0.75) !important;
  color: #5E6B62 !important;
}
.leaflet-control-attribution a { color: #93A096 !important; }
`}</style>

      {/* Filter Bar & Controls */}
      <div className="flex flex-wrap items-end gap-3 border-b border-[#182420] bg-[#050A08]/90 p-3">
        <div>
          <h2 className="vy-head flex items-center gap-2 text-lg font-semibold text-[#F4F8F5]">
            <Satellite size={17} className="text-[#00E585]" />
            VyomAcre Live Map
          </h2>
          <p className="mt-0.5 text-[10px] text-[#93A096]">
            {activeFilterCount} filters active · {displayedProperties.length} roofs found
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] font-bold uppercase tracking-wider text-[#93A096]">City</label>
          <select name="city" value={filters.city} onChange={handleFilterChange} className={SELECT_CLS}>
            <option value="ALL">All Cities</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Jaipur">Jaipur</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] font-bold uppercase tracking-wider text-[#93A096]">Roof Type</label>
          <select name="roof_type" value={filters.roof_type} onChange={handleFilterChange} className={SELECT_CLS}>
            <option value="ALL">All Types</option>
            <option value="flat">Flat</option>
            <option value="sloped">Sloped</option>
            <option value="tin">Tin</option>
            <option value="concrete">Concrete</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] font-bold uppercase tracking-wider text-[#93A096]">Min Area</label>
          <input
            type="number"
            name="min_area"
            value={filters.min_area}
            onChange={handleFilterChange}
            placeholder="0"
            className={SELECT_CLS + ' w-20'}
          />
        </div>

        <button
          onClick={() => setOnlyVerified(!onlyVerified)}
          className={
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ' +
            (onlyVerified
              ? 'border-[#00E585]/50 bg-[#00E585]/[0.1] text-[#00E585] shadow-[0_0_14px_rgba(0,229,133,0.12)]'
              : 'border-[#1C2A22] bg-[#0A1410] text-[#93A096] hover:border-[#00E585]/25 hover:text-[#C9D6CC]')
          }
        >
          <ShieldCheck size={12} />
          {onlyVerified ? 'Verified Only' : 'Only Satellite Verified'}
        </button>

        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1C2A22] bg-[#0A1410] px-3 py-1.5 text-xs font-medium text-[#93A096] transition-all duration-300 hover:border-[#00E585]/25 hover:text-[#C9D6CC]"
        >
          <RotateCcw size={12} />
          Reset
        </button>

        <button
          onClick={locateUser}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#1C2A22] bg-[#0A1410] px-3 py-1.5 text-xs font-medium text-[#C9D6CC] transition-all duration-300 hover:border-[#00E585]/40 hover:text-[#00E585]"
        >
          <Crosshair size={12} />
          My Location
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative h-full flex-1">

          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#050A08]/70 backdrop-blur-sm">
              <p className="rounded-xl border border-[#1C2A22] bg-[#0A1410] px-4 py-2 text-xs font-semibold text-[#93A096] shadow-xl">
                Loading map…
              </p>
            </div>
          )}

          <MapContainer center={[26.8500, 80.9500]} zoom={13} maxZoom={16} className="h-full w-full">
            <LocationController userLocation={userLocation} />

            {/* User's live location — pulsing dot */}
            {userLocation && (
              <Marker position={userLocation} icon={createUserPin()}>
                <Popup>
                  <p className="text-xs font-semibold text-[#E7EFE9]">You are here</p>
                </Popup>
              </Marker>
            )}
            {/* Dark tiles — Esri World Dark Gray (no API key, free) */}
            <TileLayer
n              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri — Esri, DeLorme, NAVTEQ"
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              attribution=""
            />

            {/* Radar Scanned Zones */}
            {radarActive && scannedZones.map((zone) => {
              if (zone.north && zone.south && zone.east && zone.west) {
                const bounds = [[zone.south, zone.west], [zone.north, zone.east]];
                return (
                  <Rectangle key={zone.grid_id} bounds={bounds} pathOptions={{ color: '#00E585', fillColor: '#00E585', fillOpacity: 0.12, weight: 1.5 }}>
                    <Popup><p className="text-xs font-bold text-[#E7EFE9]">Scanned Grid: {zone.grid_id}</p></Popup>
                  </Rectangle>
                );
              }
              return null;
            })}

            {/* Pins Render With Animated Wave and Status Mapping */}
            {displayedProperties.map((property, idx) => {
              if (property.latitude && property.longitude) {
                const status = getPropertyStatus(property);
                const firstName = property.owner_name ? property.owner_name.split(' ')[0] : 'Owner';

                // Micro-offset for identical coordinates
                const offsetLat = Number(property.latitude) + (idx % 3 === 0 ? 0.0012 * Math.floor(idx / 3) : -0.0012 * idx);
                const offsetLng = Number(property.longitude) + (idx % 2 === 0 ? 0.0015 * idx : -0.0015 * Math.floor(idx / 2));

                return (
                  <Marker
                    key={property.id}
                    position={[offsetLat, offsetLng]}
                    icon={createStatusPin(status)}
                  >
                    <Popup>
                      <div className="min-w-[170px] text-xs">
                        <div className="mb-1 flex items-start justify-between">
                          <strong className="text-sm capitalize text-[#F4F8F5]">{firstName}</strong>
                          <span
                            className={
                              'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ' +
                              (status === 'approved'
                                ? 'bg-[#00E585]/15 text-[#4FFFAB]'
                                : status === 'flagged'
                                ? 'bg-red-500/15 text-red-300'
                                : 'bg-amber-500/15 text-amber-300')
                            }
                          >
                            {status === 'approved' ? 'Verified' : status === 'flagged' ? 'Flagged' : 'Pending'}
                          </span>
                        </div>
                        <p className="mt-1 text-[#93A096]">Area: <strong className="text-[#E7EFE9]">{property.area_sqft || property.estimated_area_sqft || 0} sq ft</strong></p>
                        <p className="text-[#93A096]">Type: <span className="capitalize text-[#E7EFE9]">{property.roof_type}</span></p>
                        <p className="text-[#93A096]">City: <span className="text-[#E7EFE9]">{property.city || 'Lucknow'}</span></p>

                        <button
                          onClick={() => handleLeaseRequest(property.id, property.owner_name)}
                          disabled={leaseSubmitting === property.id}
                          className="mt-3 w-full rounded-lg bg-[#00E585] px-3 py-1.5 text-xs font-bold text-[#04160C] transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
                        >
                          {leaseSubmitting === property.id ? 'Sending…' : 'Send Lease Request'}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              }

              return null;
            })}
          </MapContainer>
        </div>

        {/* Right Sidebar — sibling of the map wrapper so it always stays visible */}
        <div className="w-64 shrink-0 overflow-y-auto border-l border-[#182420] bg-[#050A08]/90 p-3 pb-6 sm:w-72">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#93A096]">Live Properties</h3>
            <button
              onClick={() => setRadarActive(!radarActive)}
              className={
                'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold transition-all duration-300 ' +
                (radarActive
                  ? 'border-[#00E585]/50 bg-[#00E585]/[0.1] text-[#00E585]'
                  : 'border-[#1C2A22] bg-[#0A1410] text-[#93A096]')
              }
            >
              <Radio size={10} />
              Radar {radarActive ? 'ON' : 'OFF'}
            </button>
          </div>

          {errorMsg ? (
            <p className="rounded-lg border border-red-900/50 bg-red-900/20 px-3 py-6 text-center text-xs text-red-400">{errorMsg}</p>
          ) : displayedProperties.length === 0 && !loading ? (
            <p className="rounded-lg border border-dashed border-[#1C2A22] px-3 py-6 text-center text-xs text-[#93A096]">
              {onlyVerified
                ? 'No verified roofs found for the selected criteria.'
                : 'No roofs found yet. New listings will appear here.'}
            </p>
          ) : (
            displayedProperties.map((property) => {
              const status = getPropertyStatus(property);

              return (
                <div
                  key={property.id}
                  className="mb-2.5 rounded-xl border border-[#1C2A22] bg-[#0A1410] p-3 transition-all duration-300 hover:border-[#00E585]/25"
                >
                  <div className="mb-1 flex items-start justify-between">
                    <span className="block text-[10px] text-[#93A096]/60">#{String(property.id).substring(0, 8)}</span>
                    <span
                      className={
                        'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ' +
                        (status === 'approved'
                          ? 'bg-[#00E585]/15 text-[#4FFFAB]'
                          : status === 'flagged'
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-amber-500/15 text-amber-300')
                      }
                    >
                      {status === 'approved' ? 'Verified' : status === 'flagged' ? 'Flagged' : 'Pending'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold capitalize text-[#F4F8F5]">{property.owner_name ? property.owner_name.split(' ')[0] : 'Owner'}</h4>
                  <div className="mt-1 text-xs text-[#93A096]">
                    <p>{property.area_sqft || property.estimated_area_sqft || 0} sq ft · <span className="capitalize">{property.roof_type}</span></p>
                    <p className="mt-0.5">City: {property.city || 'Lucknow'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default MapDashboard;
