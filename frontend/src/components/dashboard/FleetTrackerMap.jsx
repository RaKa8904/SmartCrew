import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../../services/socket';
import { Plane, AlertTriangle, Search, Compass, ShieldAlert, Check } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useTheme } from '../../context/ThemeContext';

// Common airport coordinates for looking up paths
const AIRPORTS = {
    // ── US ──
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy Intl' },
    'LAX': { lat: 33.9416, lng: -118.4085, name: 'Los Angeles Intl' },
    'ORD': { lat: 41.9742, lng: -87.9073, name: "Chicago O'Hare Intl" },
    'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth Intl' },
    'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta Intl' },
    'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami Intl' },
    'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco Intl' },
    'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma Intl' },
    'BOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan Intl' },
    'DEN': { lat: 39.8561, lng: -104.6737, name: 'Denver Intl' },
    'IAH': { lat: 29.9844, lng: -95.3414, name: 'George Bush Intercontinental' },
    'EWR': { lat: 40.6895, lng: -74.1745, name: 'Newark Liberty Intl' },

    // ── Europe ──
    'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow' },
    'CDG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle' },
    'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport' },
    'AMS': { lat: 52.3105, lng: 4.7683, name: 'Amsterdam Schiphol' },
    'MAD': { lat: 40.4983, lng: -3.5676, name: 'Adolfo Suárez Madrid–Barajas' },
    'FCO': { lat: 41.8003, lng: 12.2389, name: 'Rome Fiumicino' },
    'IST': { lat: 41.2753, lng: 28.7519, name: 'Istanbul Airport' },
    'ZRH': { lat: 47.4647, lng: 8.5492, name: 'Zurich Airport' },
    'MUC': { lat: 48.3537, lng: 11.7750, name: 'Munich Airport' },

    // ── Middle East & Africa ──
    'DXB': { lat: 25.2532, lng: 55.3657, name: 'Dubai Intl' },
    'DOH': { lat: 25.2731, lng: 51.6081, name: 'Hamad Intl' },
    'AUH': { lat: 24.4330, lng: 54.6511, name: 'Abu Dhabi Intl' },
    'JNB': { lat: -26.1392, lng: 28.2460, name: 'O. R. Tambo Intl' },
    'CAI': { lat: 30.1219, lng: 31.4056, name: 'Cairo Intl' },
    'ADD': { lat: 8.9779, lng: 38.7993, name: 'Addis Ababa Bole Intl' },
    'NBO': { lat: -1.3192, lng: 36.9278, name: 'Jomo Kenyatta Intl' },

    // ── Asia-Pacific ──
    'SIN': { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi' },
    'HND': { lat: 35.5494, lng: 139.7798, name: 'Tokyo Haneda' },
    'NRT': { lat: 35.7720, lng: 140.3929, name: 'Narita Intl' },
    'ICN': { lat: 37.4602, lng: 126.4407, name: 'Incheon Intl' },
    'HKG': { lat: 22.3080, lng: 113.9185, name: 'Hong Kong Intl' },
    'BKK': { lat: 13.6900, lng: 100.7501, name: 'Suvarnabhumi' },
    'KUL': { lat: 2.7456, lng: 101.7072, name: 'Kuala Lumpur Intl' },
    'PEK': { lat: 40.0799, lng: 116.6031, name: 'Beijing Capital Intl' },
    'PVG': { lat: 31.1443, lng: 121.8083, name: 'Shanghai Pudong Intl' },
    'SYD': { lat: -33.9399, lng: 151.1753, name: 'Sydney Kingsford Smith' },
    'MEL': { lat: -37.6733, lng: 144.8431, name: 'Melbourne Tullamarine' },
    'AKL': { lat: -37.0082, lng: 174.7850, name: 'Auckland Airport' },

    // ── India Hubs ──
    'DEL': { lat: 28.5562, lng: 77.1000, name: 'Indira Gandhi Intl' },
    'BOM': { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji Maharaj Intl' },
    'BLR': { lat: 13.1986, lng: 77.7066, name: 'Kempegowda Intl' },
    'MAA': { lat: 12.9941, lng: 80.1709, name: 'Chennai Intl' },
    'HYD': { lat: 17.2403, lng: 78.4294, name: 'Rajiv Gandhi Intl' },
    'CCU': { lat: 22.6520, lng: 88.4463, name: 'Netaji Subhas Chandra Bose Intl' },
    'GOI': { lat: 15.3809, lng: 73.8314, name: 'Goa Manohar Intl' },
    'COK': { lat: 10.1520, lng: 76.4019, name: 'Cochin Intl' },
};

// Map Tiler Configurations
const DARK_MAP_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_MAP_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

// Generate curved (quadratic Bezier) route path points between two coords
const getBezierRoutePoints = (start, end, numPoints = 25) => {
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;
    const points = [];

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // curvature proportional to distance
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    const offset = dist * 0.12;

    const pLat = -dLng;
    const pLng = dLat;
    const len = Math.sqrt(pLat * pLat + pLng * pLng);

    if (len === 0) return [start, end];

    const controlLat = midLat + (pLat / len) * offset;
    const controlLng = midLng + (pLng / len) * offset;

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const u = 1 - t;
        const lat = u * u * lat1 + 2 * u * t * controlLat + t * t * lat2;
        const lng = u * u * lng1 + 2 * t * u * controlLng + t * t * lng2;
        points.push([lat, lng]);
    }
    return points;
};

// Custom radar icon with animated sweeping circle
const createRadarIcon = (bearing, status, isSelected) => {
    const isDelayed = status === 'DELAYED';
    const primaryColor = isSelected ? '#10b981' : (isDelayed ? '#ef4444' : 'var(--electric)');

    const htmlMarkup = renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-8 h-8">
            {/* Animated Pulsing Ring */}
            <div 
                className="absolute rounded-full border opacity-75"
                style={{
                    width: '32px',
                    height: '32px',
                    borderColor: primaryColor,
                    animation: 'map-radar-pulse 2s infinite ease-out',
                    backgroundColor: isSelected ? 'rgba(16,185,129,0.08)' : 'transparent',
                }}
            />
            {/* Center Core dot */}
            <div 
                className="absolute w-2 h-2 rounded-full z-20"
                style={{ backgroundColor: primaryColor }}
            />
            {/* Rotating Arrow/Plane */}
            <div 
                style={{ transform: `rotate(${bearing}deg)` }} 
                className="relative z-10 flex items-center justify-center"
            >
                <Plane size={18} color={primaryColor} fill={primaryColor} />
            </div>
        </div>
    );

    return L.divIcon({
        html: htmlMarkup,
        className: 'custom-plane-icon-container',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

// Helper component to handle flying the map to the selected marker
const MapController = ({ focusFlight, flyTrigger }) => {
    const map = useMap();

    useEffect(() => {
        if (focusFlight && flyTrigger) {
            map.flyTo(
                [focusFlight.currentLocation.lat, focusFlight.currentLocation.lng],
                6,
                { animate: true, duration: 1.5 }
            );
        }
    }, [focusFlight, flyTrigger, map]);

    return null;
};

const FleetTrackerMap = () => {
    const { theme } = useTheme();
    const [liveFlights, setLiveFlights] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFlightId, setSelectedFlightId] = useState(null);
    const [flyTrigger, setFlyTrigger] = useState(0);

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tileUrl = isDark ? DARK_MAP_TILES : LIGHT_MAP_TILES;

    useEffect(() => {
        // Listen for WebSocket updates from the backend
        socket.on('fleet-positions', (data) => {
            setLiveFlights(data || []);
        });

        return () => {
            socket.off('fleet-positions');
        };
    }, []);

    // Filter flights based on search query
    const filteredFlights = liveFlights.filter(f => 
        f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedFlight = liveFlights.find(f => f.id === selectedFlightId);

    const handleFlightClick = (flight) => {
        setSelectedFlightId(flight.id);
        setFlyTrigger(prev => prev + 1);
    };

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/30 flex">
            {/* Scoped CSS animations and popup overrides */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes map-radar-pulse {
                    0% { transform: scale(0.6); opacity: 1; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                .leaflet-popup-content-wrapper {
                    background: var(--panel) !important;
                    color: var(--text-base) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                    backdrop-filter: blur(12px) !important;
                    padding: 4px !important;
                }
                .leaflet-popup-tip {
                    background: var(--panel) !important;
                    border: 1px solid var(--border) !important;
                }
                .leaflet-container a.leaflet-popup-close-button {
                    color: var(--text-muted) !important;
                    padding: 8px 8px 0 0 !important;
                }
                .custom-plane-icon-container {
                    background: transparent;
                    border: none;
                }
            `}} />

            {/* Sidebar Flight List Panel */}
            <div className="absolute top-4 left-4 z-[999] w-72 max-h-[calc(100%-2rem)] flex flex-col bg-slate-950/85 dark:bg-black/85 border border-slate-800/40 p-4 rounded-2xl backdrop-blur-xl shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-2 mb-3">
                    <Compass size={18} className="text-primary-500 animate-spin" style={{ animationDuration: '6s' }} />
                    <h2 className="font-bold text-sm text-white uppercase tracking-wider">Fleet Radar</h2>
                    <span className="text-[10px] bg-primary-500/20 text-primary-400 font-bold px-2 py-0.5 rounded-full ml-auto">
                        {liveFlights.length} Active
                    </span>
                </div>

                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search flight number / route..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                {/* Flights List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar max-h-[320px] lg:max-h-none">
                    {filteredFlights.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No active flights tracked</p>
                    ) : (
                        filteredFlights.map((flight) => {
                            const isSelected = flight.id === selectedFlightId;
                            const isDelayed = flight.status === 'DELAYED';
                            return (
                                <div 
                                    key={flight.id}
                                    onClick={() => handleFlightClick(flight)}
                                    className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                        isSelected 
                                        ? 'bg-primary-500/10 border-primary-500/40' 
                                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-slate-800/40'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white tracking-wide">{flight.flightNumber}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                            <span className="font-semibold text-white">{flight.origin}</span>
                                            <span>✈</span>
                                            <span className="font-semibold text-white">{flight.destination}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {isDelayed ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                <ShieldAlert size={10} /> DELAYED
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <Check size={10} /> IN_FLIGHT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div className="flex-1 w-full h-full z-0">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%', background: isDark ? '#000000' : '#f8fafc' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        key={tileUrl}
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url={tileUrl}
                    />

                    <MapController focusFlight={selectedFlight} flyTrigger={flyTrigger} />

                    {/* Flight Markers & Route Paths */}
                    {liveFlights.map((flight) => {
                        const origin = AIRPORTS[flight.origin];
                        const destination = AIRPORTS[flight.destination];
                        const isSelected = flight.id === selectedFlightId;
                        const isDelayed = flight.status === 'DELAYED';

                        // Curved bezier flight route path
                        let bezierPoints = null;
                        if (origin && destination) {
                            bezierPoints = getBezierRoutePoints(
                                [origin.lat, origin.lng],
                                [destination.lat, destination.lng]
                            );
                        }

                        return (
                            <React.Fragment key={flight.id}>
                                {/* Path Polyline */}
                                {bezierPoints && (
                                    <Polyline
                                        positions={bezierPoints}
                                        pathOptions={{
                                            color: isSelected ? '#10b981' : (isDelayed ? '#ef4444' : 'var(--electric)'),
                                            weight: isSelected ? 2.5 : 1.5,
                                            dashArray: isSelected ? '0' : '4,6',
                                            opacity: isSelected ? 0.9 : 0.45,
                                        }}
                                    />
                                )}

                                {/* Plane Marker */}
                                <Marker
                                    position={[flight.currentLocation.lat, flight.currentLocation.lng]}
                                    icon={createRadarIcon(flight.bearing, flight.status, isSelected)}
                                    eventHandlers={{
                                        click: () => setSelectedFlightId(flight.id),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-1 min-w-[180px]">
                                            <div className="flex items-center justify-between border-b border-slate-200/20 pb-2 mb-2">
                                                <h3 className="font-bold text-sm text-white tracking-tight">
                                                    Flight {flight.flightNumber}
                                                </h3>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    BRG: {Math.round(flight.bearing)}°
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-semibold mb-2">
                                                <div className="text-center flex-1">
                                                    <p className="text-[10px] text-slate-500">ORIGIN</p>
                                                    <p className="text-white text-base mt-0.5">{flight.origin}</p>
                                                </div>
                                                <Plane size={14} className="mx-2 text-primary-500 animate-pulse" />
                                                <div className="text-center flex-1">
                                                    <p className="text-[10px] text-slate-500">DEST</p>
                                                    <p className="text-white text-base mt-0.5">{flight.destination}</p>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mb-2 border-t border-slate-200/10 pt-2 space-y-1">
                                                <p><span className="text-slate-500">Lat:</span> {flight.currentLocation.lat.toFixed(4)}</p>
                                                <p><span className="text-slate-500">Lng:</span> {flight.currentLocation.lng.toFixed(4)}</p>
                                            </div>
                                            <div className={`text-xs font-bold py-1 rounded flex items-center justify-center ${
                                                isDelayed ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                {isDelayed && <AlertTriangle size={12} className="mr-1" />}
                                                <span>{flight.status}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            </React.Fragment>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default FleetTrackerMap;
