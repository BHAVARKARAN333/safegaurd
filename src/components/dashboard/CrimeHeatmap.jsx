import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to dynamically fit all bounds
function FitBounds({ incidents }) {
    const map = useMap();
    useEffect(() => {
        if (incidents.length > 0) {
            const validLocs = incidents.filter(i => i?.location?.latitude && i?.location?.longitude);
            if (validLocs.length > 0) {
                const bounds = L.latLngBounds(validLocs.map(i => [i.location.latitude, i.location.longitude]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        }
    }, [incidents, map]);
    return null;
}

function CrimeHeatmap({ incidents }) {
    // We only want incidents that have valid GPS data
    const validIncidents = incidents.filter(i => i?.location?.latitude && i?.location?.longitude);

    // Default center (Mumbai approx)
    const center = validIncidents.length > 0
        ? [validIncidents[0].location.latitude, validIncidents[0].location.longitude]
        : [19.1136, 72.8697];

    return (
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden mt-8">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        AI Crime & SOS Heatmap
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Aggregated density analysis of historical and active emergencies.</p>
                </div>
                <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                    <span className="text-xs font-mono text-slate-300">
                        <span className="text-red-400 font-bold">{validIncidents.length}</span> Datapoints
                    </span>
                </div>
            </div>

            <div className="h-[400px] w-full relative">
                {validIncidents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900 z-[500]">
                        Insufficient geographical data to generate heatmap model.
                    </div>
                )}

                <MapContainer
                    center={center}
                    zoom={10}
                    style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
                    zoomControl={false}
                >
                    {/* Dark/Carto basemap to make the glowing red heatmap pop */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {validIncidents.map((inc) => (
                        <React.Fragment key={inc.id}>
                            {/* Inner Hot Core (Small, Opaque) */}
                            <CircleMarker
                                center={[inc.location.latitude, inc.location.longitude]}
                                radius={8}
                                pathOptions={{
                                    color: 'transparent',
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.4
                                }}
                            />
                            {/* Outer Heat Radius (Large, Highly Transparent) */}
                            <CircleMarker
                                center={[inc.location.latitude, inc.location.longitude]}
                                radius={40}
                                pathOptions={{
                                    color: 'transparent',
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.15
                                }}
                            />
                        </React.Fragment>
                    ))}

                    <FitBounds incidents={validIncidents} />
                </MapContainer>

                {/* Heatmap Legend Overlay */}
                <div className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Density Legend</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-red-500/10 to-red-600"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Low/Isolated</span>
                        <span>High Risk Zone</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CrimeHeatmap;
