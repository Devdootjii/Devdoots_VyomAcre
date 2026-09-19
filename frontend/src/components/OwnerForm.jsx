import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Satellite, MapPin, Maximize, Crosshair, Home } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { submitRoofDetails } from '../services/api';

/* ============================================================
   VyomAcre — List Your Roof (owner form)
   - Roof type as segmented pills
   - Same payload + validations as before
   - submitRoofDetails → /owner-dashboard
   ============================================================ */

const ROOF_TYPES = [
  { value: 'flat', label: 'Flat', icon: Home },
  { value: 'sloped', label: 'Sloped', icon: Home },
  { value: 'tin', label: 'Tin', icon: Home },
  { value: 'concrete', label: 'Concrete', icon: Home },
  { value: 'other', label: 'Other', icon: Home },
];

const initialFormData = {
  roof_type: 'flat',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  area_sqft: '',
};

/* ---------- map location picker (no Google Maps needed) ---------- */
const ROOF_PIN = L.divIcon({
  className: 'vy-roof-pin',
  html: `
    <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #00E585; opacity: 0.25; animation: vyPinPulse 1.8s ease-out infinite;"></div>
      <div style="position: relative; width: 12px; height: 12px; border-radius: 50%; background: #00E585; border: 2.5px solid #050A08; box-shadow: 0 0 14px rgba(0,229,133,0.9);"></div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function MapClickPicker({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

/* fly the map to a target once it changes */
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 1.2 });
  }, [target, map]);
  return null;
}

function LocationPickerMap({ lat, lng, onPick, flyTarget, view }) {
  const hasPin =
    lat !== '' && lng !== '' &&
    !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng)) &&
    Number(lat) >= -90 && Number(lat) <= 90 &&
    Number(lng) >= -180 && Number(lng) <= 180;

  const center = hasPin ? [Number(lat), Number(lng)] : [26.8467, 80.9467];

  return (
    <MapContainer center={center} zoom={hasPin ? 17 : 13} maxZoom={18} className="h-full w-full cursor-crosshair">
      <MapClickPicker onPick={onPick} />
      <MapFlyTo target={flyTarget} />
      {view === 'satellite' ? (
        <TileLayer
          key="sat"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
          maxZoom={18}
          maxNativeZoom={17}
        />
      ) : (
        <>
          <TileLayer
            key="dark"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri — Esri, DeLorme, NAVTEQ"
            maxZoom={18}
            maxNativeZoom={16}
          />
          <TileLayer
            key="darkref"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            maxZoom={18}
            maxNativeZoom={16}
          />
        </>
      )}
      {hasPin && (
        <Marker
          position={[Number(lat), Number(lng)]}
          icon={ROOF_PIN}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = e.target.getLatLng();
              onPick(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}

/* ---------- shared field ---------- */
const FIELD =
  'w-full rounded-xl border border-[#1C2A22] bg-[#0A1410] px-4 py-3 text-sm text-[#F4F8F5] outline-none transition-all duration-300 placeholder:text-[#5E6B62] focus:border-[#00E585]/50 focus:shadow-[0_0_0_3px_rgba(0,229,133,0.08)]';

const OwnerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /* map picker: live location detection */
  const [flyTarget, setFlyTarget] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mapView, setMapView] = useState('satellite');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setFlyTarget(loc);
        setFormData((p) => ({ ...p, latitude: loc[0].toFixed(6), longitude: loc[1].toFixed(6) }));
        setLocating(false);
      },
      () => {
        alert('Location access permission was denied. Allow location in the browser, or tap the map to place the pin manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));

    setError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (
      !formData.roof_type ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      formData.latitude === '' ||
      formData.longitude === ''
    ) {
      setError('Please fill all required fields.');
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError('Please enter a valid latitude between -90 and 90.');
      return;
    }

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError('Please enter a valid longitude between -180 and 180.');
      return;
    }

    const roofData = {
      roof_type: formData.roof_type,
      address: formData.address.trim(),
      city: formData.city.trim(),
      latitude,
      longitude,
    };

    if (formData.area_sqft !== '') {
      const area = Number(formData.area_sqft);

      if (Number.isNaN(area) || area <= 0) {
        setError('Area must be a valid positive number.');
        return;
      }

      roofData.area_sqft = area;
    }

    try {
      setLoading(true);

      await submitRoofDetails(roofData);

      setMessage('Roof listing submitted successfully!');

      setFormData(initialFormData);

      setTimeout(() => {
        navigate('/owner-dashboard');
      }, 1200);
    } catch (err) {
      console.error('Roof submission failed:', err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          'Unable to submit roof listing.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050A08] px-4 py-12 text-[#E7EFE9] sm:px-6"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
@keyframes vyPinPulse {
  0% { transform: scale(0.6); opacity: 0.9; }
  70% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
}
.vy-roof-pin { background: transparent !important; border: none !important; }
.leaflet-container { background: #050A08 !important; font-family: inherit; }
.leaflet-bar a { background: #0A1410 !important; color: #93A096 !important; border-color: #1C2A22 !important; }
.leaflet-bar a:hover { background: #071009 !important; color: #00E585 !important; }
.leaflet-control-attribution { background: rgba(5,10,8,0.75) !important; color: #5E6B62 !important; }
.leaflet-control-attribution a { color: #93A096 !important; }
`}</style>

      <div className="relative mx-auto max-w-3xl">
        {/* ambient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-80px] h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-[#00E585]/[0.05] blur-[130px]"
        />

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#071009]/80 px-3.5 py-1.5">
            <Satellite size={12} className="text-[#00E585]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#93A096]">
              Owner Portal
            </span>
          </div>

          <h1 className="vy-head mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            List your <span className="text-[#00E585]">roof</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-7 text-[#93A096]">
            Add your rooftop details so businesses can discover your property.
            Our satellite engine verifies every listing on the map.
          </p>
        </motion.div>

        {/* form card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-8 rounded-[1.75rem] border border-[#1C2A22] bg-[#071009]/70 p-6 backdrop-blur sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00E585]/40 to-transparent"
          />

          {/* Roof Type — segmented pills */}
          <div className="mb-6">
            <label className="mb-2.5 block text-sm font-medium text-[#C9D6CC]">
              Roof Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {ROOF_TYPES.map((t) => {
                const active = formData.roof_type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, roof_type: t.value }));
                      setError('');
                    }}
                    className={
                      'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-300 ' +
                      (active
                        ? 'border-[#00E585]/50 bg-[#00E585]/[0.08] text-[#00E585] shadow-[0_0_16px_rgba(0,229,133,0.1)]'
                        : 'border-[#1C2A22] bg-[#0A1410] text-[#93A096] hover:border-[#00E585]/25 hover:text-[#C9D6CC]')
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
              Address <span className="text-red-400">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete rooftop address"
              required
              rows={3}
              className={FIELD + ' resize-none'}
            />
          </div>

          {/* City */}
          <div className="mb-6">
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
              City <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#93A096]"
              />
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Lucknow"
                required
                className={FIELD + ' pl-11'}
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="mb-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="latitude" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
                Latitude <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Crosshair
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#93A096]"
                />
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 26.8467"
                  required
                  className={FIELD + ' pl-11'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="longitude" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
                Longitude <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Crosshair
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#93A096]"
                />
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 80.9462"
                  required
                  className={FIELD + ' pl-11'}
                />
              </div>
            </div>

            <p className="text-xs leading-5 text-[#93A096]/80 sm:col-span-2">
              Easiest way: click the map below to drop a pin exactly on your rooftop — drag it to fine-tune.
              You can still type the coordinates manually.
            </p>
          </div>

          {/* Map picker — click to set coordinates */}
          <div className="mb-6 overflow-hidden rounded-xl border border-[#1C2A22]">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#182420] bg-[#071009] px-4 py-2.5">
              <MapPin size={13} className="text-[#00E585]" />
              <span className="text-xs font-medium text-[#C9D6CC]">Pick your rooftop on the map</span>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#1C2A22] bg-[#0A1410] px-3 py-1.5 text-[11px] font-semibold text-[#C9D6CC] transition-all duration-300 hover:border-[#00E585]/50 hover:text-[#00E585] disabled:opacity-60"
              >
                <Crosshair size={11} className={locating ? 'animate-spin' : ''} />
                {locating ? 'Detecting…' : 'Detect my location'}
              </button>

              <button
                type="button"
                onClick={() => setMapView((v) => (v === 'satellite' ? 'dark' : 'satellite'))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1C2A22] bg-[#0A1410] px-3 py-1.5 text-[11px] font-semibold text-[#C9D6CC] transition-all duration-300 hover:border-[#00E585]/50 hover:text-[#00E585]"
              >
                <Satellite size={11} />
                {mapView === 'satellite' ? 'Dark view' : 'Satellite view'}
              </button>
            </div>
            <div className="h-64 sm:h-72">
              <LocationPickerMap
                lat={formData.latitude}
                lng={formData.longitude}
                flyTarget={flyTarget}
                view={mapView}
                onPick={(la, ln) =>
                  setFormData((p) => ({ ...p, latitude: la.toFixed(6), longitude: ln.toFixed(6) }))
                }
              />
            </div>
          </div>

          {/* Area */}
          <div className="mb-7">
            <label htmlFor="area_sqft" className="mb-2 block text-sm font-medium text-[#C9D6CC]">
              Area (sq ft)
            </label>
            <div className="relative">
              <Maximize
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#93A096]"
              />
              <input
                id="area_sqft"
                name="area_sqft"
                type="number"
                min="0"
                step="any"
                value={formData.area_sqft}
                onChange={handleChange}
                placeholder="Optional"
                className={FIELD + ' pl-11'}
              />
            </div>

            <p className="mt-2 text-xs text-[#00E585]/80">
              Leave blank — the satellite engine estimates this automatically.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* Success */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-[#00E585]/25 bg-[#00E585]/[0.07] px-4 py-3 text-sm text-[#4FFFAB]"
            >
              {message}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00E585] px-6 py-3.5 text-sm font-semibold text-[#04160C] shadow-[0_0_22px_rgba(0,229,133,0.22)] transition-all duration-300 hover:shadow-[0_0_34px_rgba(0,229,133,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#04160C]/30 border-t-[#04160C]" />
                Submitting…
              </>
            ) : (
              <>
                Submit Roof Listing
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default OwnerForm;
