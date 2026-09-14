import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getVerifiedRoofs, getScannedZones, createLeaseRequest } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
          getScannedZones()
        ]);

        if (roofsRes.status === 'fulfilled' && roofsRes.value?.data) {
          const list = Array.isArray(roofsRes.value.data)
            ? roofsRes.value.data
            : (roofsRes.value.data.data || []);
          setProperties(list);
        } else {
          setProperties([]);
        }

        if (zonesRes.status === 'fulfilled' && zonesRes.value?.data) {
          const zones = Array.isArray(zonesRes.value.data)
            ? zonesRes.value.data
            : (zonesRes.value.data.data || []);
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
    const areaMatch = Number(item.area_sqft || 0) >= Number(minArea || 0);
    const itemType = (item.roof_type || item.property_type || '').toLowerCase();
    const typeMatch = roofType === 'ALL' || itemType === roofType.toLowerCase();
    return areaMatch && typeMatch;
  });

  const handleLeaseRequest = async (roofId, ownerName) => {
    setLeaseSubmitting(roofId);
    try {
      const payload = {
        roof_id: String(roofId),
        company_name: 'SolarCorp B2B'
      };
      const res = await createLeaseRequest(payload);
      alert(`Success: Lease request created for ${ownerName}! (Status: ${res.status})`);
    } catch (error) {
      alert(`Error submitting lease request: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLeaseSubmitting(null);
    }
  };

  return (
    <div className="w-full h-[720px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-blue-400">VyomAcre</h2>
            <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700">
              Live Production
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Connected: Render Cloud API</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition ${
              radarActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {radarActive ? 'Radar: ACTIVE' : 'Radar: OFF'}
          </button>

          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Min Area (sq ft)</label>
            <input
              type="number"
              min="0"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Roof Type</label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
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
      </div>

      {/* Map & Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full relative">
          <MapContainer center={[26.8467, 80.9462]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {radarActive && scannedZones.map((zone) => {
              if (zone.north && zone.south && zone.east && zone.west) {
                const bounds = [[zone.south, zone.west], [zone.north, zone.east]];
                const isScanned = zone.status === 'scanned';
                return (
                  <Rectangle
                    key={zone.grid_id}
                    bounds={bounds}
                    pathOptions={{
                      color: isScanned ? '#64748b' : '#10b981',
                      fillColor: isScanned ? '#475569' : '#10b981',
                      fillOpacity: isScanned ? 0.45 : 0.2,
                      weight: 1.5,
                      dashArray: isScanned ? '4' : null,
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">Grid: {zone.grid_id}</p>
                        <p className="text-slate-600">Status: <span className="uppercase font-semibold">{zone.status}</span></p>
                        {zone.gee_estimated_area_sqft && (
                          <p className="text-slate-600">Area: {zone.gee_estimated_area_sqft} sq ft</p>
                        )}
                      </div>
                    </Popup>
                  </Rectangle>
                );
              }
              return null;
            })}

            {filteredListings.map((property) => {
              if (property.latitude && property.longitude) {
                return (
                  <Marker key={property.id} position={[Number(property.latitude), Number(property.longitude)]}>
                    <Popup>
                      <div className="text-xs font-sans">
                        <strong className="text-blue-900 text-sm">{property.owner_name}</strong>
                        <p className="text-slate-600 mt-1">Area: {property.area_sqft} sq ft</p>
                        <p className="text-slate-600">Roof: <span className="capitalize">{property.roof_type}</span></p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-green-100 text-green-700">
                          {property.verification_status || property.status || 'Verified'}
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

        <div className="w-80 bg-slate-950 border-l border-slate-800 p-3 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-300">Verified Roofs</span>
            <span className="text-[10px] bg-blue-900/60 text-blue-300 font-bold px-2 py-0.5 rounded">
              {filteredListings.length} Live
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Connecting to live cloud engine...</p>
          ) : errorMsg ? (
            <p className="text-xs text-amber-500 text-center py-6">{errorMsg}</p>
          ) : filteredListings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No verified roofs listed in database yet.</p>
          ) : (
            filteredListings.map((property) => (
              <div key={property.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-2.5 hover:border-slate-700 transition">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-slate-500">#{String(property.id).substring(0, 8)}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-green-900/40 text-green-400 border border-green-800">
                    {property.verification_status || 'Verified'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{property.owner_name}</h4>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                  <p>Type: <span className="capitalize text-slate-200">{property.roof_type}</span></p>
                  <p>Area: <span className="text-blue-400 font-semibold">{property.area_sqft} sq ft</span></p>
                </div>

                <button
                  onClick={() => handleLeaseRequest(property.id, property.owner_name)}
                  disabled={leaseSubmitting === property.id}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition active:scale-95"
                >
                  {leaseSubmitting === property.id ? 'Sending...' : 'Send Lease Request'}
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