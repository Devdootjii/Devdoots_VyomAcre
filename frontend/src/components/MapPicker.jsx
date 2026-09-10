import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle map clicks and prevent crash
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng); 
        },
    });

    // SAFETY CHECK: Agar position null ya undefined hai, toh Marker load nahi hoga (No Crash!)
    if (!position || position.lat === undefined) {
        return null;
    }

    return (
        <Marker position={position}></Marker>
    );
}

export default function MapPicker({ position, setPosition }) {
    return (
        <div className="h-64 w-full rounded-md overflow-hidden border border-slate-300">
            {/* Default center set to Lucknow (26.8467, 80.9462) */}
            <MapContainer 
                center={[26.8467, 80.9462]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
        </div>
    );
}