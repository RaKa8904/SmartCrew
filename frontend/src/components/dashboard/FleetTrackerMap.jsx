import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../../services/socket';
import { Plane, AlertTriangle } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Map Tiler for Dark Mode
const DARK_MAP_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Create a custom SVG icon using Lucide React for the airplane
const createPlaneIcon = (rotation, status) => {
    const isDelayed = status === 'DELAYED';
    const color = isDelayed ? '#ef4444' : '#3b82f6'; // Red for delayed, Blue for on-time

    const iconMarkup = renderToStaticMarkup(
        <div style={{ transform: `rotate(${rotation}deg)` }}>
            <Plane size={24} color={color} fill={color} />
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-plane-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const FleetTrackerMap = () => {
    const [liveFlights, setLiveFlights] = useState([]);

    useEffect(() => {
        // Listen for WebSocket updates from the backend
        socket.on('fleet-positions', (data) => {
            setLiveFlights(data);
        });

        return () => {
            socket.off('fleet-positions');
        };
    }, []);

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
            <MapContainer
                center={[20, 0]} // Center of the world
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={DARK_MAP_TILES}
                />

                {liveFlights.map((flight) => (
                    <Marker
                        key={flight.id}
                        position={[flight.currentLocation.lat, flight.currentLocation.lng]}
                        icon={createPlaneIcon(flight.bearing, flight.status)}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                                    Flight {flight.flightNumber}
                                </h3>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-slate-500 font-semibold">{flight.origin}</span>
                                    <Plane size={14} className="mx-2 text-slate-400" />
                                    <span className="text-slate-500 font-semibold">{flight.destination}</span>
                                </div>
                                <div className="mt-2 text-xs font-semibold px-2 py-1 rounded bg-slate-100 flex items-center justify-center">
                                    {flight.status === 'DELAYED' && <AlertTriangle size={12} className="text-red-500 mr-1" />}
                                    <span className={flight.status === 'DELAYED' ? 'text-red-600' : 'text-blue-600'}>
                                        {flight.status}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FleetTrackerMap;
