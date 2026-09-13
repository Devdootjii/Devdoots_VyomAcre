import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllRoofs, getVerifiedRoofs, getScannedZones, createLeaseRequest } from '../services/api';

// Dynamic Color-coded Markers based on verification status
const createCustomIcon = (status) => {
  let color = '#3b82f6'; // Blue default
  if (status === 'verified' || status === 'approved') color = '#10b981'; // Green
  else if (status === 'flagged') color = '#f59e0b'; // Amber / Orange
  else if (status === 'verification_failed') color = '#ef4444'; // Red

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-pin',
    html: svgHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const MapDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [scannedZones, setScannedZones] = useState([]);
  const [minArea, setMinArea] = useState(0);
  const [propertyType, setPropertyType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [radarActive, setRadarActive] = useState(true);
  const [showAllStatus, setShowAllStatus] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchLiveData = useCallback(async () => {
    try {
      const roofPromise = showAllStatus ? getAllRoofs() : getVerifiedRoofs();
      const [roofsRes, zonesRes] = await Promise.allSettled([
        roofPromise,
        getScannedZones()
      ]);

      if (roofsRes.status === 'fulfilled' && roofsRes.value?.data?.data) {
        setProperties(roofsRes.value.data.data);
      }

      if (zonesRes.status === 'fulfilled' && zonesRes.value?.data?.data) {
        setScannedZones(zonesRes.value.data.data);
      }
    } catch (error) {
      console.error("Satellite API sync failed", error);
    } finally {
      setLoading(false);
    }
  }, [showAllStatus]);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const filteredListings = properties.filter((item) => {
    const area = Number(item.area_sqft || 0);
    const areaMatch = area >= Number(minArea || 0);
    const itemType = (item.roof_type || item.property_type || '').toLowerCase();
    const typeMatch = propertyType === 'ALL' || itemType === propertyType.toLowerCase();
    return areaMatch && typeMatch;
  });

  const handleLeaseRequest = async (roofId) => {
    setSubmittingId(roofId);
    setToastMsg(null);
    try {
      const payload = {
        roof_id: roofId,
        company_name: 'SolarCorp'
      };

      await createLeaseRequest(payload);
      setToastMsg({ type: 'success', text: 'Request sent!' });
    } catch (error) {
      setToastMsg({ type: 'error', text: 'Failed to send request. Try again.' });
    } finally {
      setSubmittingId(null);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  return (
    <div className="flex flex-col h-[720px] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl relative">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`absolute top-4 right-4 z-50 px-4 py-2 rounded shadow-lg font-bold text-sm ${
          toastMsg.type === 'success' ? 'bg-green-500 text-green-950' : 'bg-red-500 text-red-100'
        }`}>
          {toastMsg.text}
        </div>
      )}

      {/* Header & Controls */}
      <div className="px-6 py-3 bg-slate-950 flex flex-wrap justify-between items-center z-10 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-black text-blue-400 tracking-tight">VyomAcre</h1>
            <p className="text-[11px] text-slate-400">Satellite Monitoring Map</p>
          </div>
          <button
            onClick={fetchLiveData}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 transition"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAllStatus(!showAllStatus)}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition ${
              showAllStatus ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {showAllStatus ? 'Showing: All Listings' : 'Showing: Verified Only'}
          </button>

          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`text-xs px-2.5 py-1 rounded font-bold border transition ${
              radarActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {radarActive ? 'Radar: ON' : 'Radar: OFF'}
          </button>

          <div className="flex flex-col">
            <input
              type="number"
              min="0"
              placeholder="Min SqFt"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="border border-slate-700 bg-slate-800 text-white px-2 py-1 rounded text-xs outline-none focus:border-blue-500 w-20 font-mono"
            />
          </div>

          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="border border-slate-700 bg-slate-800 text-white px-2 py-1 rounded text-xs outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="flat">Flat</option>
            <option value="sloped">Sloped</option>
            <option value="tin">Tin</option>
            <option value="concrete">Concrete</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Map & Listing View */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 h-full relative z-0 bg-slate-800">
          <MapContainer center={[26.8467, 80.9462]} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Scanned Zones Overlay */}
            {radarActive && scannedZones.map((zone) => {
              if (zone.north && zone.south && zone.east && zone.west) {
                const bounds = [[zone.south, zone.west], [zone.north, zone.east]];
                const isScanned = zone.status === 'scanned';
                return (
                  <Rectangle
                    key={zone.grid_id}
                    bounds={bounds}
                    pathOptions={{
                      color: isScanned ? '#10b981' : '#64748b',
                      fillColor: isScanned ? '#10b981' : '#475569',
                      fillOpacity: isScanned ? 0.25 : 0.45,
                      weight: 1.5,
                      dashArray: isScanned ? null : '4',
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">Grid ID: {zone.grid_id}</p>
                        <p className="text-slate-600">Status: <span className="uppercase font-semibold">{zone.status}</span></p>
                        {zone.gee_estimated_area_sqft && (
                          <p className="text-slate-600">GEE Est Area: {zone.gee_estimated_area_sqft} sq ft</p>
                        )}
                      </div>
                    </Popup>
                  </Rectangle>
                );
              }
              return null;
            })}

            {/* Micro-offsetted Pins so duplicate coordinates don't hide each other */}
            {filteredListings.map((property, idx) => {
              if (property.latitude && property.longitude) {
                const offsetLat = Number(property.latitude) + (idx * 0.0006);
                const offsetLng = Number(property.longitude) + (idx * 0.0006);
                const currentStatus = property.verification_status || property.status;

                return (
                  <Marker
                    key={property.id}
                    position={[offsetLat, offsetLng]}
                    icon={createCustomIcon(currentStatus)}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong className="text-blue-900 text-sm">{property.owner_name}</strong>
                        <p className="text-slate-600 mt-1">Area: <span className="font-semibold">{property.area_sqft} sq ft</span></p>
                        <p className="text-slate-600">GEE Est: <span className="font-semibold">{property.gee_estimated_area_sqft || 'Verifying...'} sq ft</span></p>
                        <p className="text-slate-600">Type: <span className="font-semibold capitalize">{property.roof_type}</span></p>
                        <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          currentStatus === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : currentStatus === 'flagged'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="w-80 p-3 overflow-y-auto bg-slate-950 border-l border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-slate-300">Live Listings</h2>
            <span className="text-[10px] font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded">
              {filteredListings.length} Found
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Syncing with backend...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No properties found.</div>
          ) : (
            filteredListings.map((property) => (
              <div key={property.id} className="bg-slate-900 p-3 mb-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-slate-500">#{String(property.id).substring(0, 8)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    (property.verification_status || property.status) === 'verified'
                      ? 'bg-green-900/40 text-green-400 border border-green-800'
                      : (property.verification_status || property.status) === 'flagged'
                      ? 'bg-amber-900/40 text-amber-400 border border-amber-800'
                      : 'bg-red-900/40 text-red-400 border border-red-800'
                  }`}>
                    {property.verification_status || property.status}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm">{property.owner_name}</h3>
                <div className="text-xs text-slate-400 space-y-0.5 mt-1">
                  <p>Type: <span className="text-slate-200 capitalize">{property.roof_type}</span></p>
                  <p>Area: <span className="font-semibold text-blue-400">{property.area_sqft} sq ft</span></p>
                  {property.gee_estimated_area_sqft && (
                    <p className="text-[11px] text-amber-400">GEE Est: {property.gee_estimated_area_sqft} sq ft</p>
                  )}
                </div>
                <button
                  onClick={() => handleLeaseRequest(property.id)}
                  disabled={submittingId === property.id}
                  className="mt-2.5 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition active:scale-95"
                >
                  {submittingId === property.id ? 'Sending...' : 'Send Lease Request'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;