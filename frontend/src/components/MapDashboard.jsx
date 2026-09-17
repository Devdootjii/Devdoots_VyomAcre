import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getFilteredRoofs, getVerifiedRoofs, getScannedZones, createLeaseRequest } from '../services/api';

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

// High-Tech Radar Scanning Pins (Blue = Verified, Red = Flagged, Yellow = Pending)
const createStatusPin = (status) => {
  let pinColor = '#eab308'; // Default Pending: Yellow
  if (status === 'approved') pinColor = '#2563eb'; // Verified: Blue
  if (status === 'flagged') pinColor = '#ef4444'; // Flagged: Red

  return L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <!-- Animated Radar Wave Pulse 1 -->
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${pinColor}; background-color: ${pinColor}; opacity: 0.35; animation: radarPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;"></div>
        <!-- Animated Radar Wave Pulse 2 -->
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${pinColor}; background-color: ${pinColor}; opacity: 0.35; animation: radarPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 0.75s;"></div>
        <!-- Glowing Core Center -->
        <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 0 10px ${pinColor}; animation: coreGlow 2s ease-in-out infinite;"></div>
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
    <div className="w-full h-[720px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl relative">
      
      {/* Dynamic Keyframe Injection for Scanning Ripple Animation */}
      <style>{`
        @keyframes radarPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes coreGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px currentColor); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 8px currentColor); }
        }
        .custom-radar-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Filter Bar & Controls */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-end gap-3">
        <div>
          <h2 className="text-lg font-black text-blue-400">VyomAcre Map</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {activeFilterCount} filters active | {displayedProperties.length} roofs found
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">City</label>
          <select name="city" value={filters.city} onChange={handleFilterChange} className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700 focus:border-blue-500">
            <option value="ALL">All Cities</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Jaipur">Jaipur</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">Roof Type</label>
          <select name="roof_type" value={filters.roof_type} onChange={handleFilterChange} className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700 focus:border-blue-500">
            <option value="ALL">All Types</option>
            <option value="flat">Flat</option>
            <option value="sloped">Sloped</option>
            <option value="tin">Tin</option>
            <option value="concrete">Concrete</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">Min Area</label>
          <input type="number" name="min_area" value={filters.min_area} onChange={handleFilterChange} placeholder="0" className="w-20 bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700" />
        </div>

        <button
          onClick={() => setOnlyVerified(!onlyVerified)}
          className={`text-xs px-3 py-1.5 rounded border font-semibold transition ${
            onlyVerified 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/50' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {onlyVerified ? '✓ Only Verified' : 'Only Satellite Verified'}
        </button>

        <button onClick={resetFilters} className="text-xs bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition">
          Reset
        </button>
        
        <button onClick={locateUser} className="text-xs bg-blue-900/50 text-blue-300 hover:bg-blue-800 px-3 py-1.5 rounded border border-blue-700 transition ml-auto font-medium">
          My Location
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full relative">
          
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <p className="text-white text-xs font-bold bg-slate-800 px-4 py-2 rounded-lg shadow-xl border border-slate-700">Loading map...</p>
            </div>
          )}

          <MapContainer center={[26.8500, 80.9500]} zoom={13} className="h-full w-full">
            <LocationController userLocation={userLocation} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Radar Scanned Zones */}
            {radarActive && scannedZones.map((zone) => {
              if (zone.north && zone.south && zone.east && zone.west) {
                const bounds = [[zone.south, zone.west], [zone.north, zone.east]];
                return (
                  <Rectangle key={zone.grid_id} bounds={bounds} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 1.5 }}>
                    <Popup><p className="text-xs font-bold text-slate-900">Scanned Grid: {zone.grid_id}</p></Popup>
                  </Rectangle>
                );
              }
              return null;
            })}

            {/* Pins Render with Animated Wave and Status Mapping */}
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
                      <div className="text-xs min-w-[160px]">
                        <div className="flex justify-between items-start mb-1">
                          <strong className="text-blue-900 text-sm capitalize">{firstName}</strong>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            status === 'approved'
                              ? 'bg-green-100 text-green-700' 
                              : status === 'flagged'
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {status === 'approved' ? 'Verified' : status === 'flagged' ? 'Flagged' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">Area: <strong className="text-slate-900">{property.area_sqft || property.estimated_area_sqft || 0} sq ft</strong></p>
                        <p className="text-slate-600">Type: <span className="capitalize">{property.roof_type}</span></p>
                        <p className="text-slate-600">City: {property.city || 'Lucknow'}</p>
                        
                        <button
                          onClick={() => handleLeaseRequest(property.id, property.owner_name)}
                          disabled={leaseSubmitting === property.id}
                          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-1.5 px-3 rounded text-xs transition active:scale-95"
                        >
                          {leaseSubmitting === property.id ? 'Sending...' : 'Send Lease Request'}
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

        {/* Right Sidebar */}
        <div className="w-72 bg-slate-950 border-l border-slate-800 p-3 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-300">Live Properties</h3>
            <button onClick={() => setRadarActive(!radarActive)} className={`text-[10px] px-2 py-0.5 rounded font-bold border ${radarActive ? 'bg-indigo-900 text-indigo-300 border-indigo-700' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              Radar {radarActive ? 'ON' : 'OFF'}
            </button>
          </div>

          {errorMsg ? (
            <p className="text-xs text-red-400 text-center py-6 bg-red-900/20 rounded border border-red-900/50">{errorMsg}</p>
          ) : displayedProperties.length === 0 && !loading ? (
            <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded">
              {onlyVerified 
                ? 'No verified roofs found for selected criteria.' 
                : 'Abhi koi verified roof nahi hai. Naye roofs add hote hi yahan dikhenge.'}
            </p>
          ) : (
            displayedProperties.map((property) => {
              const status = getPropertyStatus(property);

              return (
                <div key={property.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2.5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-slate-500 block">#{String(property.id).substring(0, 8)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      status === 'approved'
                        ? 'bg-green-900/40 text-green-400 border border-green-800' 
                        : status === 'flagged'
                        ? 'bg-red-900/40 text-red-400 border border-red-800' 
                        : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                    }`}>
                      {status === 'approved' ? 'Verified' : status === 'flagged' ? 'Flagged' : 'Pending'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white capitalize">{property.owner_name ? property.owner_name.split(' ')[0] : 'Owner'}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    <p>{property.area_sqft || property.estimated_area_sqft || 0} sq ft • <span className="capitalize">{property.roof_type}</span></p>
                    <p className="mt-0.5">City: {property.city || 'Lucknow'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;