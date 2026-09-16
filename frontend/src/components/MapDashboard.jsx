import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllRoofs, getFilteredRoofs, getScannedZones, createLeaseRequest } from '../services/api';

// Status-based dynamic marker generator
const getStatusMarkerIcon = (status) => {
  let color = '#3b82f6'; // Verified: Blue
  if (status === 'flagged') color = '#ef4444'; // Flagged: Red
  if (status === 'pending_verification' || status === 'PENDING') color = '#eab308'; // Pending: Yellow

  return L.divIcon({
    className: 'custom-status-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
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
  
  const [filters, setFilters] = useState({ city: 'ALL', roof_type: 'ALL', min_area: '', max_area: '' });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  const [radarActive, setRadarActive] = useState(true);
  const [leaseSubmitting, setLeaseSubmitting] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [roofsRes, zonesRes] = await Promise.allSettled([
        getAllRoofs(filters), // Fetches all statuses: verified, pending, flagged
        getScannedZones()
      ]);

      if (roofsRes.status === 'fulfilled' && roofsRes.value?.data) {
        const liveList = Array.isArray(roofsRes.value.data) 
          ? roofsRes.value.data 
          : (roofsRes.value.data.data || []);
        setProperties(liveList);
      } else {
        setProperties([]);
      }

      if (zonesRes.status === 'fulfilled' && zonesRes.value?.data) {
        const zoneList = Array.isArray(zonesRes.value.data) 
          ? zonesRes.value.data 
          : (zonesRes.value.data.data || []);
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

  const filteredListings = properties.filter((item) => {
    const area = Number(item.area_sqft || item.estimated_area_sqft || 0);
    const minMatch = filters.min_area ? area >= Number(filters.min_area) : true;
    const maxMatch = filters.max_area ? area <= Number(filters.max_area) : true;
    const cityMatch = filters.city === 'ALL' || (item.city && item.city.toLowerCase() === filters.city.toLowerCase());
    const itemType = (item.roof_type || item.property_type || '').toLowerCase();
    const typeMatch = filters.roof_type === 'ALL' || itemType === filters.roof_type.toLowerCase();
    return minMatch && maxMatch && cityMatch && typeMatch;
  });

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
      alert('Authentication required. Only registered Seekers can dispatch lease requests.');
      return;
    }

    setLeaseSubmitting(roofId);
    try {
      const payload = { roof_id: String(roofId), duration: 12, rent: 0, message: "Interested in leasing" };
      await createLeaseRequest(payload);
      alert(`Success: Lease request dispatched for property #${String(roofId).substring(0, 8)}`);
    } catch (error) {
      alert(`Error submitting request: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLeaseSubmitting(null);
    }
  };

  return (
    <div className="w-full h-[720px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl">
      
      {/* Top Filter Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-end gap-3">
        <div>
          <h2 className="text-lg font-black text-blue-400">VyomAcre Map</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{activeFilterCount} filters active | {filteredListings.length} properties total</p>
        </div>

        <div className="flex flex-col">
          <label className="text-[9px] text-slate-400 uppercase font-bold">City</label>
          <select name="city" value={filters.city} onChange={handleFilterChange} className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded outline-none border border-slate-700 focus:border-blue-500">
            <option value="ALL">All Cities</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bangalore">Bangalore</option>
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

        <button onClick={resetFilters} className="text-xs bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition">Reset</button>
        
        <button onClick={locateUser} className="text-xs bg-blue-900/50 text-blue-300 hover:bg-blue-800 px-3 py-1.5 rounded border border-blue-700 transition ml-auto font-medium">
          My Location
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full relative">
          
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <p className="text-white text-xs font-bold bg-slate-800 px-4 py-2 rounded-lg shadow-xl border border-slate-700">Loading live data...</p>
            </div>
          )}

          <MapContainer center={[26.8467, 80.9462]} zoom={12} className="h-full w-full">
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

            <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
              {filteredListings.map((property) => {
                if (property.latitude && property.longitude) {
                  const status = property.verification_status || property.status || 'pending_verification';
                  return (
                    <Marker 
                      key={property.id} 
                      position={[Number(property.latitude), Number(property.longitude)]} 
                      icon={getStatusMarkerIcon(status)}
                    >
                      <Popup>
                        <div className="text-xs min-w-[150px]">
                          <div className="flex justify-between items-start mb-1">
                            <strong className="text-blue-900 text-sm capitalize">{property.owner_name?.split(' ')[0] || 'Owner'}</strong>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              status === 'verified' 
                                ? 'bg-green-100 text-green-700' 
                                : status === 'flagged' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {status === 'verified' ? 'Verified by Satellite' : status === 'flagged' ? 'Issue Found' : 'Verification Pending'}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">Area: <strong className="text-slate-900">{property.area_sqft || property.estimated_area_sqft || 'Calculating...'} sq ft</strong></p>
                          <p className="text-slate-600">Type: <span className="capitalize">{property.roof_type}</span></p>
                          <p className="text-slate-600">City: {property.city}</p>
                          
                          <button
                            onClick={() => handleLeaseRequest(property.id, property.owner_name)}
                            disabled={leaseSubmitting === property.id || status !== 'verified'}
                            className={`mt-3 w-full font-bold py-1.5 px-3 rounded text-xs transition ${
                              status === 'verified' 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {status === 'verified' 
                              ? (leaseSubmitting === property.id ? 'Processing...' : 'Send Lease Request')
                              : 'Pending Verification'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MarkerClusterGroup>
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
          ) : filteredListings.length === 0 && !loading ? (
            <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded">
              No registered roofs found.
            </p>
          ) : (
            filteredListings.map((property) => {
              const status = property.verification_status || property.status || 'pending_verification';
              return (
                <div key={property.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2.5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-slate-500">#{String(property.id).substring(0, 8)}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      status === 'verified' 
                        ? 'bg-green-900/40 text-green-400 border border-green-800' 
                        : status === 'flagged' 
                        ? 'bg-red-900/40 text-red-400 border border-red-800' 
                        : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white capitalize">{property.owner_name?.split(' ')[0]}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    <p>{property.area_sqft || property.estimated_area_sqft || 0} sq ft • <span className="capitalize">{property.roof_type}</span></p>
                    <p className="mt-0.5">City: {property.city}</p>
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