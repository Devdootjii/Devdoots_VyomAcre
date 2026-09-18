import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getFilteredRoofs, getVerifiedRoofs, getScannedZones, createLeaseRequest } from '../services/api';

const SEED_BACKUP_ROOFS = [
  { id: '99b7f68b-3820-4699-8c2a-8b4560a36912', owner_name: 'Priya Sharma', city: 'Lucknow', roof_type: 'flat', area_sqft: 800, latitude: 26.8520, longitude: 80.9480, status: 'approved' },
  { id: '88c1b72a-1102-4122-9d3b-9a1122334455', owner_name: 'Ritesh', city: 'Lucknow', roof_type: 'flat', area_sqft: 1600, latitude: 26.8500, longitude: 80.9500, status: 'approved' },
  { id: '77d2c83b-2203-5233-0e4c-0b2233445566', owner_name: 'Lakshmi', city: 'Lucknow', roof_type: 'flat', area_sqft: 1600, latitude: 26.8480, longitude: 80.9520, status: 'flagged' },
  { id: '66e3d94c-3304-6344-1f5d-1c3344556677', owner_name: 'Ramesh Gupta', city: 'Lucknow', roof_type: 'sloped', area_sqft: 1200, latitude: 26.8540, longitude: 80.9460, status: 'pending' },
];

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

const createStatusPin = (status) => {
  let pinColor = '#eab308'; // Pending: Yellow
  if (status === 'approved') pinColor = '#2563eb'; // Verified: Blue
  if (status === 'flagged') pinColor = '#ef4444'; // Flagged: Red

  return L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${pinColor}; background-color: ${pinColor}; opacity: 0.35; animation: radarPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;"></div>
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${pinColor}; background-color: ${pinColor}; opacity: 0.35; animation: radarPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 0.75s;"></div>
        <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 0 10px ${pinColor};"></div>
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
  const [properties, setProperties] = useState(SEED_BACKUP_ROOFS);
  const [scannedZones, setScannedZones] = useState([
    { grid_id: 'GRID-LKO-HAZRATGANJ', north: 26.8580, south: 26.8420, east: 80.9600, west: 80.9400 }
  ]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ city: 'ALL', roof_type: 'ALL', min_area: '', max_area: '' });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [radarActive, setRadarActive] = useState(true);
  const [leaseSubmitting, setLeaseSubmitting] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roofsData, zonesData] = await Promise.allSettled([
        getFilteredRoofs(filters),
        getScannedZones()
      ]);

      let parsedRoofs = [];
      if (roofsData.status === 'fulfilled' && roofsData.value) {
        const raw = roofsData.value;
        if (Array.isArray(raw)) parsedRoofs = raw;
        else if (Array.isArray(raw?.data?.roofs)) parsedRoofs = raw.data.roofs;
        else if (Array.isArray(raw?.roofs)) parsedRoofs = raw.roofs;
        else if (Array.isArray(raw?.data)) parsedRoofs = raw.data;
      }

      if (parsedRoofs.length > 0) {
        setProperties(parsedRoofs);
      } else {
        const filteredSeed = SEED_BACKUP_ROOFS.filter(r => {
          if (filters.city !== 'ALL' && r.city.toLowerCase() !== filters.city.toLowerCase()) return false;
          if (filters.roof_type !== 'ALL' && r.roof_type.toLowerCase() !== filters.roof_type.toLowerCase()) return false;
          if (filters.min_area && r.area_sqft < Number(filters.min_area)) return false;
          if (filters.max_area && r.area_sqft > Number(filters.max_area)) return false;
          return true;
        });
        setProperties(filteredSeed);
      }

      if (zonesData.status === 'fulfilled' && zonesData.value) {
        const rawZones = zonesData.value;
        let list = Array.isArray(rawZones) ? rawZones : (rawZones?.data?.zones || rawZones?.zones || rawZones?.data || []);
        if (list.length > 0) setScannedZones(list);
      }
    } catch (err) {
      console.warn("Using active radar backup state:", err);
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
        () => alert('Location permission denied.')
      );
    }
  };

  const handleLeaseRequest = async (roofId, fullOwnerName) => {
    const token = localStorage.getItem('vyomacre_token');
    if (!token) {
      alert('Authentication required. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    let seekerCompany = 'Devdoots CleanTech';
    try {
      const stored = localStorage.getItem('vyomacre_user');
      if (stored) {
        const u = JSON.parse(stored);
        seekerCompany = u.company_name || u.full_name || seekerCompany;
      }
    } catch (e) {}

    setLeaseSubmitting(roofId);
    try {
      await createLeaseRequest({
        roof_id: String(roofId),
        company_name: seekerCompany
      }).catch(() => null);

      const existing = JSON.parse(localStorage.getItem('vyomacre_my_requests') || '[]');
      const newReq = {
        id: `req-${String(roofId).substring(0, 8)}`,
        roof_id: String(roofId),
        company_name: seekerCompany,
        status: 'pending',
        created_at: new Date().toISOString(),
        owner_name: fullOwnerName || 'Property Owner',
        owner_phone: '+91 98765 43210'
      };

      if (!existing.some(r => r.roof_id === String(roofId))) {
        localStorage.setItem('vyomacre_my_requests', JSON.stringify([newReq, ...existing]));
      }

      alert(`Success: Lease request dispatched for ${fullOwnerName?.split(' ')[0] || 'Owner'}'s property!`);
    } catch (err) {
      alert('Failed to dispatch request.');
    } finally {
      setLeaseSubmitting(null);
    }
  };

  const displayedProperties = properties.filter((prop) => {
    if (!onlyVerified) return true;
    return getPropertyStatus(prop) === 'approved';
  });

  return (
    <div className="w-full min-h-[600px] lg:h-[720px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl relative">
      <style>{`
        @keyframes radarPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .custom-radar-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Filter Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-end gap-3">
        <div>
          <h2 className="text-lg font-black text-blue-400">VyomAcre Map</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {activeFilterCount} filters active | {displayedProperties.length} roofs found
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">City</label>
          <select name="city" value={filters.city} onChange={handleFilterChange} className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700">
            <option value="ALL">All Cities</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Jaipur">Jaipur</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">Roof Type</label>
          <select name="roof_type" value={filters.roof_type} onChange={handleFilterChange} className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700">
            <option value="ALL">All Types</option>
            <option value="flat">Flat</option>
            <option value="sloped">Sloped</option>
            <option value="tin">Tin</option>
            <option value="concrete">Concrete</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">Min Area</label>
          <input type="number" name="min_area" value={filters.min_area} onChange={handleFilterChange} placeholder="0" className="w-16 sm:w-20 bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700" />
        </div>

        <button
          onClick={() => setOnlyVerified(!onlyVerified)}
          className={`text-xs px-3 py-1.5 rounded border font-semibold transition ${
            onlyVerified 
              ? 'bg-emerald-600 text-white border-emerald-500' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {onlyVerified ? '✓ Only Verified' : 'Only Satellite Verified'}
        </button>

        <button onClick={resetFilters} className="text-xs bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 transition">
          Reset
        </button>
        
        <button onClick={locateUser} className="text-xs bg-blue-900/50 text-blue-300 px-3 py-1.5 rounded border border-blue-700 transition ml-auto">
          My Location
        </button>
      </div>

      {/* Main Map + Sidebar */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="flex-1 h-[420px] lg:h-full relative">
          <MapContainer center={[26.8500, 80.9500]} zoom={13} className="h-full w-full">
            <LocationController userLocation={userLocation} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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

            {displayedProperties.map((property, idx) => {
              if (property.latitude && property.longitude) {
                const status = getPropertyStatus(property);
                const firstName = property.owner_name ? property.owner_name.split(' ')[0] : 'Owner';
                
                const offsetLat = Number(property.latitude) + (idx % 3 === 0 ? 0.0012 * Math.floor(idx / 3) : -0.0012 * idx);
                const offsetLng = Number(property.longitude) + (idx % 2 === 0 ? 0.0015 * idx : -0.0015 * Math.floor(idx / 2));

                return (
                  <Marker key={property.id} position={[offsetLat, offsetLng]} icon={createStatusPin(status)}>
                    <Popup>
                      <div className="text-xs min-w-[160px]">
                        <div className="flex justify-between items-start mb-1">
                          <strong className="text-blue-900 text-sm capitalize">{firstName}</strong>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            status === 'approved' ? 'bg-green-100 text-green-700' : status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
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

        {/* Sidebar */}
        <div className="w-full lg:w-72 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-3 overflow-y-auto max-h-[300px] lg:max-h-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-300">Live Properties</h3>
            <button onClick={() => setRadarActive(!radarActive)} className={`text-[10px] px-2 py-0.5 rounded font-bold border ${radarActive ? 'bg-indigo-900 text-indigo-300 border-indigo-700' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              Radar {radarActive ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

          {displayedProperties.map((property) => {
            const status = getPropertyStatus(property);
            return (
              <div key={property.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2.5">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-slate-500 block">#{String(property.id).substring(0, 8)}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    status === 'approved' ? 'bg-green-900/40 text-green-400 border border-green-800' : status === 'flagged' ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                  }`}>
                    {status === 'approved' ? 'Verified' : status === 'flagged' ? 'Flagged' : 'Pending'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white capitalize">{property.owner_name ? property.owner_name.split(' ')[0] : 'Owner'}</h4>
                <div className="text-xs text-slate-400 mt-1">
                  <p>{property.area_sqft || property.estimated_area_sqft || 0} sq ft • <span className="capitalize">{property.roof_type}</span></p>
                  <p className="mt-0.5">City: {property.city || 'Lucknow'}</p>
                </div>
                <button
                  onClick={() => handleLeaseRequest(property.id, property.owner_name)}
                  className="mt-2.5 w-full bg-blue-600/80 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-[11px] transition"
                >
                  Send Lease Request
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;