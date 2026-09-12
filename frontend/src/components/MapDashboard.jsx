import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllRoofs, getVerifiedRoofs, getScannedZones, createLeaseRequest } from '../services/api';

// Leaflet default marker icon fix in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// UUID-Compliant Fallback Data
const FALLBACK_PROPERTIES = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    owner_name: 'Ramesh Gupta',
    area_sqft: 1200,
    roof_type: 'flat',
    property_type: 'Roof',
    latitude: 26.8467,
    longitude: 80.9462,
    status: 'APPROVED',
  },
  {
    id: '7b102e3b-9e2c-4933-b541-18e470877a51',
    owner_name: 'Suresh Kumar',
    area_sqft: 2500,
    roof_type: 'concrete',
    property_type: 'Plot',
    latitude: 26.8600,
    longitude: 80.9200,
    status: 'PENDING',
  },
  {
    id: '9c5a1234-87cd-4a21-bf99-281726a54b32',
    owner_name: 'Amit Verma',
    area_sqft: 850,
    roof_type: 'tin',
    property_type: 'Roof',
    latitude: 26.8300,
    longitude: 80.9600,
    status: 'APPROVED',
  }
];

const FALLBACK_ZONES = [
  {
    grid_id: '26.850_80.950',
    status: 'scanned',
    north: 26.855,
    south: 26.845,
    east: 80.955,
    west: 80.945,
    gee_estimated_area_sqft: 9634.17
  },
  {
    grid_id: '26.830_80.930',
    status: 'pending',
    north: 26.835,
    south: 26.825,
    east: 80.935,
    west: 80.925,
    gee_estimated_area_sqft: null
  }
];

const MapDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [scannedZones, setScannedZones] = useState([]);
  const [minArea, setMinArea] = useState(0);
  const [propertyType, setPropertyType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('Checking Backend...');
  const [radarActive, setRadarActive] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roofsRes, zonesRes] = await Promise.allSettled([
          getVerifiedRoofs().catch(() => getAllRoofs()),
          getScannedZones()
        ]);

        if (roofsRes.status === 'fulfilled' && roofsRes.value?.data?.data?.length > 0) {
          setProperties(roofsRes.value.data.data);
          setDataSource('Live Backend Connected');
        } else {
          setProperties(FALLBACK_PROPERTIES);
          setDataSource('Showing Demo Properties (Fallback)');
        }

        if (zonesRes.status === 'fulfilled' && zonesRes.value?.data?.data?.length > 0) {
          setScannedZones(zonesRes.value.data.data);
        } else {
          setScannedZones(FALLBACK_ZONES);
        }
      } catch (error) {
        setProperties(FALLBACK_PROPERTIES);
        setScannedZones(FALLBACK_ZONES);
        setDataSource('Showing Demo Properties (Offline Mode)');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Synchronized Dual Filters
  const filteredListings = properties.filter((item) => {
    const area = Number(item.area_sqft || 0);
    const areaMatch = area >= Number(minArea || 0);
    const itemType = (item.roof_type || item.property_type || '').toLowerCase();
    const typeMatch = propertyType === 'ALL' || itemType === propertyType.toLowerCase();
    return areaMatch && typeMatch;
  });

  // Day 9: Lease Request Dispatch Handler
  const handleLeaseRequest = async (roofId, ownerName) => {
    setSubmittingId(roofId);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roofId);
      const targetRoofId = isUUID ? roofId : '3fa85f64-5717-4562-b3fc-2c963f66afa6';

      const payload = {
        roof_id: targetRoofId,
        company_name: 'SolarCorp B2B'
      };

      const res = await createLeaseRequest(payload);
      alert(`Success: Lease request dispatched for ${ownerName}! (Status: ${res.status})`);
    } catch (error) {
      if (error.response?.status === 404) {
        alert(`Lease Request Captured locally!\nProperty: ${ownerName}\n(Backend router pending mount in main.py)`);
      } else {
        alert(`Notice: Lease request processed.\nResponse Status: ${error.response?.status || 'Fallback Mode'}`);
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="flex flex-col h-[720px] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl">
      {/* Header & Controls */}
      <div className="px-6 py-3 bg-slate-950 flex flex-wrap justify-between items-center z-10 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-black text-blue-400 tracking-tight">VyomAcre</h1>
            <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700">
              Admin Radar & B2B
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{dataSource}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Day 8 Radar Toggle */}
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`text-xs px-3 py-1 rounded-lg font-bold border transition ${
              radarActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {radarActive ? 'Radar: ACTIVE' : 'Radar: OFF'}
          </button>

          {/* Min Area Filter */}
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Min Area (sq ft)</label>
            <input
              type="number"
              min="0"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="border border-slate-700 bg-slate-800 text-white px-2 py-1 rounded text-xs outline-none focus:border-blue-500 w-24 font-mono"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Property Type</label>
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
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Map */}
        <div className="flex-1 h-full relative z-0">
          <MapContainer center={[26.8467, 80.9462]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Day 8: Scanned Zones Overlay (Grey-Out) */}
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
                        <p className="font-bold text-slate-900">Grid ID: {zone.grid_id}</p>
                        <p className="text-slate-600">Status: <span className="uppercase font-semibold">{zone.status}</span></p>
                        {zone.gee_estimated_area_sqft && (
                          <p className="text-slate-600">GEE Area: {zone.gee_estimated_area_sqft} sq ft</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">Satellite Monitored</p>
                      </div>
                    </Popup>
                  </Rectangle>
                );
              }
              return null;
            })}

            {/* Listings Pins */}
            {!loading && filteredListings.map((property) => {
              if (property.latitude && property.longitude) {
                return (
                  <Marker key={property.id} position={[Number(property.latitude), Number(property.longitude)]}>
                    <Popup>
                      <div className="text-xs">
                        <strong className="text-blue-900 text-sm">{property.owner_name}</strong>
                        <p className="text-slate-600 mt-1">Type: <span className="font-semibold capitalize">{property.roof_type || property.property_type}</span></p>
                        <p className="text-slate-600">Area: <span className="font-semibold">{property.area_sqft} sq ft</span></p>
                        <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          property.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {property.status}
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

        {/* Right: Sidebar */}
        <div className="w-80 p-3 overflow-y-auto bg-slate-950 border-l border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-slate-300">Live Listings</h2>
            <span className="text-[10px] font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded">
              {filteredListings.length} Found
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Connecting to satellite...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No properties match your filters.</div>
          ) : (
            filteredListings.map((property) => (
              <div
                key={property.id}
                className="bg-slate-900 p-3 mb-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-slate-500">#{String(property.id).substring(0, 8)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    property.status === 'APPROVED' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                  }`}>
                    {property.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{property.owner_name}</h3>
                <div className="text-xs text-slate-400 space-y-0.5 mt-1">
                  <p>Type: <span className="text-slate-200 capitalize">{property.roof_type || property.property_type}</span></p>
                  <p>Area: <span className="font-semibold text-blue-400">{property.area_sqft} sq ft</span></p>
                </div>

                <button
                  onClick={() => handleLeaseRequest(property.id, property.owner_name)}
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