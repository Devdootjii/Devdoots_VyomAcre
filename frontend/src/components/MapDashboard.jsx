import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllRoofs } from '../services/api';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Resilient Fallback Data (Days 5-7 Schema compliant)
const FALLBACK_PROPERTIES = [
  {
    id: 'roof-101',
    owner_name: 'Ramesh Gupta',
    area_sqft: 1200,
    property_type: 'Roof',
    latitude: 26.8467,
    longitude: 80.9462,
    status: 'APPROVED',
  },
  {
    id: 'plot-102',
    owner_name: 'Suresh Kumar',
    area_sqft: 2500,
    property_type: 'Plot',
    latitude: 26.8600,
    longitude: 80.9200,
    status: 'PENDING',
  },
  {
    id: 'roof-103',
    owner_name: 'Amit Verma',
    area_sqft: 850,
    property_type: 'Roof',
    latitude: 26.8300,
    longitude: 80.9600,
    status: 'APPROVED',
  }
];

const MapDashboard = () => {
  // Task 3.1 & 3.3 States
  const [properties, setProperties] = useState([]);
  const [minArea, setMinArea] = useState(0);
  const [propertyType, setPropertyType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('Checking Backend...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllRoofs();
        if (response.data && response.data.length > 0) {
          setProperties(response.data);
          setDataSource('Live Backend API Connected');
        } else {
          setProperties(FALLBACK_PROPERTIES);
          setDataSource('Showing Demo Properties (Backend Empty)');
        }
      } catch (error) {
        // Backend failure resilient fallback
        setProperties(FALLBACK_PROPERTIES);
        setDataSource('Showing Demo Properties (Backend Offline)');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Task 3.3: Two-Way Bound Filtering (Min Area + Property Type)
  const filteredListings = properties.filter((item) => {
    const area = Number(item.area_sqft || 0);
    const areaMatch = area >= Number(minArea || 0);
    const itemType = item.property_type || (item.roof_type ? 'Roof' : 'Roof');
    const typeMatch = propertyType === 'ALL' || itemType.toLowerCase() === propertyType.toLowerCase();
    return areaMatch && typeMatch;
  });

  // Task 3.4: Send Lease Request Action
  const handleLeaseRequest = (id, owner) => {
    alert(`Lease Request Initiated\nProperty ID: ${id}\nOwner: ${owner}\nStatus: Captured locally, ready for POST dispatch.`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden font-sans">
      {/* Header & Filter Controls */}
      <div className="px-6 py-3 bg-white shadow-sm flex flex-wrap justify-between items-center z-10 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">VyomAcre</h1>
            <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Company Marketplace (B2B)
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{dataSource}</p>
        </div>

        <div className="flex items-center space-x-4 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Min Area (sq ft)</label>
            <input
              type="number"
              min="0"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="border border-gray-300 bg-white px-2 py-1 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 w-28 font-mono"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="border border-gray-300 bg-white px-2 py-1 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 w-32 font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="Roof">Roof</option>
              <option value="Plot">Plot</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Map */}
        <div className="w-2/3 h-full relative z-0">
          <MapContainer center={[26.8467, 80.9462]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {!loading && filteredListings.map((property) => {
              if (property.latitude && property.longitude) {
                return (
                  <Marker key={property.id} position={[Number(property.latitude), Number(property.longitude)]}>
                    <Popup>
                      <div className="text-sm">
                        <strong className="text-blue-900 text-base">{property.owner_name}</strong>
                        <p className="text-xs text-gray-600 mt-1">Type: <span className="font-semibold text-gray-800">{property.property_type || 'Roof'}</span></p>
                        <p className="text-xs text-gray-600">Area: <span className="font-semibold text-gray-800">{property.area_sqft} sq ft</span></p>
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${property.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
        <div className="w-1/3 p-4 overflow-y-auto bg-gray-50 border-l border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Available Listings</h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
              {filteredListings.length} Found
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium">No properties match your filters.</div>
          ) : (
            filteredListings.map((property) => (
              <div
                key={property.id}
                className="bg-white p-4 mb-3 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-mono text-gray-400">#{String(property.id).substring(0, 8)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${property.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {property.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base">{property.owner_name}</h3>
                <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                  <p>Type: <span className="font-medium text-gray-800">{property.property_type || 'Roof'}</span></p>
                  <p>Area: <span className="font-bold text-blue-900">{property.area_sqft} sq ft</span></p>
                </div>

                <button
                  onClick={() => handleLeaseRequest(property.id, property.owner_name)}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs tracking-wide shadow-sm transition active:scale-98"
                >
                  Send Lease Request
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