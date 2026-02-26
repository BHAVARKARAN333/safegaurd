import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

const createIcon = (color, isPulsing = false) => L.divIcon({
    className: 'custom-icon border-0 bg-transparent',
    html: isPulsing
        ? `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: flex-end; justify-content: center;">
                <div class="animate-ping" style="position: absolute; width: 20px; height: 20px; bottom: 2px; border-radius: 50%; background-color: ${color}; opacity: 0.6;"></div>
                <svg style="position: relative; z-index: 10; width: 36px; height: 36px; filter: drop-shadow(0px 8px 6px rgba(0,0,0,0.5));" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>
          `
        : `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: flex-end; justify-content: center;">
                <svg style="width: 32px; height: 32px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4)); mb-1" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>
          `,
    iconSize: [40, 40],
    iconAnchor: [20, 40] // Bottom tip points exactly to the coordinate
});

class MapErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold rounded-2xl border-4 border-slate-800">
                    <div className="text-center">
                        <div className="text-red-500 mb-2">⚠️ Satellite Link Lost</div>
                        <div className="text-sm font-normal text-slate-400">Map rendering failed</div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// React-Leaflet MapContainer ignores center/zoom changes after initial mount
// This component forces the map to fly to the newest SOS location
function MapUpdater({ center }) {
    const mapInstance = useMap();

    useEffect(() => {
        if (center && center.length === 2 && mapInstance) {
            mapInstance.flyTo(center, 14, { animate: true, duration: 2 });
        }
    }, [center, mapInstance]);

    return null;
}

const createPoiIcon = (type) => {
    let svgContent = '';
    let color = '';

    if (type === 'police') {
        color = '#1d4ed8'; // blue-700
        svgContent = `<svg viewBox="0 0 24 24" fill="white" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    } else if (type === 'hospital') {
        color = '#dc2626'; // red-600
        svgContent = `<svg viewBox="0 0 24 24" fill="white" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4));"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path><path d="M19 12H5"></path></svg>`;
    } else {
        color = '#059669'; // emerald-600
        svgContent = `<svg viewBox="0 0 24 24" fill="white" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4));"><path d="M6 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1M18 18h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-1M6 14h12M6 10h12M6 10v4M18 10v4"></path></svg>`;
    }

    return L.divIcon({
        className: 'custom-icon border-0 bg-transparent',
        html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: flex-end; justify-content: center;">
                <div class="animate-pulse" style="position: absolute; width: 14px; height: 14px; bottom: 4px; border-radius: 50%; background-color: ${color}; opacity: 0.4;"></div>
                ${svgContent}
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });
};

function MapView({ incidents, focusedIncident }) {
    const [pois, setPois] = React.useState([]);
    const [fetchingPois, setFetchingPois] = React.useState(false);

    const getIcon = (inc) => {
        const isLive = inc.status === 'Active';
        const label = isLive ? 'SOS' : 'CLR';

        // Pulse large if focused or if active and no focus
        const shouldPulse = isLive || (focusedIncident && focusedIncident.id === inc.id);
        const color = inc.status === 'Active' ? '#EF4444' : inc.status === 'Assigned' ? '#F59E0B' : '#10B981';

        return createIcon(color, shouldPulse, label);
    };

    const validLocs = incidents.filter(i => i?.location?.latitude && i?.location?.longitude);
    const activeIncident = validLocs.find(i => i.status === 'Active');

    // Choose the center based on focus first, then active, then fallback
    let center = [19.1136, 72.8697];
    if (focusedIncident?.location) {
        center = [focusedIncident.location.latitude, focusedIncident.location.longitude];
    } else if (activeIncident) {
        center = [activeIncident.location.latitude, activeIncident.location.longitude];
    } else if (validLocs.length > 0) {
        center = [validLocs[0].location.latitude, validLocs[0].location.longitude];
    }

    useEffect(() => {
        if (!activeIncident) {
            setPois([]);
            return;
        }

        const fetchPois = async () => {
            setFetchingPois(true);
            try {
                const lat = activeIncident.location.latitude;
                const lon = activeIncident.location.longitude;
                // Search within 5km radius (5000 meters)
                const radius = 5000;

                // Construct robust Overpass Query
                // We ask for police, hospitals, and pharmacies around the SOS lat/lng
                // OPTIMIZED: Only fetching nodes to reduce query complexity and prevent 504 Gateway Timeouts
                const query = `
                    [out:json][timeout:25];
                    (
                      node["amenity"="police"](around:${radius},${lat},${lon});
                      node["amenity"="hospital"](around:${radius},${lat},${lon});
                      node["amenity"="pharmacy"](around:${radius},${lat},${lon});
                    );
                    out center;
                `;

                const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
                const response = await fetch(url);

                // Fast failure if timeout hits
                if (!response.ok) {
                    throw new Error(`Overpass API Error: \${response.status}`);
                }

                const data = await response.json();

                if (data.elements) {
                    const mappedPois = data.elements.map(el => {
                        const elemetLat = el.lat || el.center?.lat;
                        const elementLon = el.lon || el.center?.lon;

                        if (!elemetLat || !elementLon) return null;

                        return {
                            id: el.id,
                            lat: elemetLat,
                            lon: elementLon,
                            type: el.tags?.amenity || 'unknown',
                            name: el.tags?.name || 'Unnamed Facility',
                            phone: el.tags?.phone || el.tags?.["contact:phone"] || 'Not Available',
                            address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || 'Location Only'
                        };
                    }).filter(Boolean);

                    setPois(mappedPois);
                }
            } catch (error) {
                console.error("Failed to fetch POIs from Overpass:", error);
                // Fail gracefully so the UI doesn't crash on 504s
                setPois([]);
            } finally {
                setFetchingPois(false);
            }
        };

        fetchPois();
    }, [activeIncident?.id]);


    return (
        <MapErrorBoundary>
            <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl relative border-4 border-slate-800">
                <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }} zoomControl={false}>
                    <MapUpdater center={activeIncident ? [activeIncident.location.latitude, activeIncident.location.longitude] : center} />
                    {/* Esri World Imagery (Satellite) Map Tiles */}
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />

                    {/* Render SOS Incidents */}
                    {validLocs.map(inc => (
                        <Marker key={inc.id} position={[inc.location.latitude, inc.location.longitude]} icon={getIcon(inc)} zIndexOffset={1000}>
                            <Popup>
                                <div className="font-sans min-w-[140px] p-1">
                                    <div className="font-bold text-slate-800 border-b pb-1 mb-2">SOS Alert #{inc.id.slice(-4)}</div>
                                    <p className="text-xs text-slate-600 m-0 leading-relaxed font-semibold">Status: <span className="text-red-600">{inc.status}</span></p>
                                    <p className="text-xs text-slate-600 m-0 leading-relaxed font-semibold mt-1">Reported by: {inc.userId || 'Anonymous'}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Render Nearby Medical & Police POIs */}
                    {pois.map(poi => (
                        <Marker key={`poi-${poi.id}`} position={[poi.lat, poi.lon]} icon={createPoiIcon(poi.type)} zIndexOffset={500}>
                            <Popup>
                                <div className="font-sans min-w-[180px] p-1">
                                    <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center \${poi.type === 'police' ? 'bg-blue-100 text-blue-700' : poi.type === 'hospital' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {poi.type === 'police' ? '🚓' : poi.type === 'hospital' ? '🏥' : '💊'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{poi.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{poi.type}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex items-start gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs text-slate-600 line-clamp-2">{poi.address || 'Location on map'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            <span className="text-xs font-medium text-slate-700">{poi.phone}</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        Dispatch Here
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Satellite Radar UI Overlay */}
                <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                        <span className="text-white text-xs font-mono font-bold tracking-widest">SAT-LINK: ACTIVE</span>
                    </div>

                    {fetchingPois && (
                        <div className="bg-blue-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-blue-400/30 flex items-center shadow-lg animate-pulse">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="text-white text-[10px] font-mono font-bold tracking-wider">SCANNING PERIMETER 5KM...</span>
                        </div>
                    )}

                    {!fetchingPois && pois.length > 0 && (
                        <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-600/50 flex flex-col gap-1 shadow-lg">
                            <span className="text-slate-300 text-[9px] font-mono font-bold uppercase">Resources Found (5km Radius)</span>
                            <div className="flex gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-white text-[10px] font-bold">{pois.filter(p => p.type === 'police').length} Police</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    <span className="text-white text-[10px] font-bold">{pois.filter(p => p.type === 'hospital').length} Med</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-white text-[10px] font-bold">{pois.filter(p => p.type === 'pharmacy').length} Rx</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MapErrorBoundary>
    );
}

export default MapView;
