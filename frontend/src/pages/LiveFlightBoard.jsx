import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Radio, RefreshCw, Plane, Clock, Users, CheckCircle2, AlertTriangle, XCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_META = {
    'on-time': { label: 'ON TIME', cls: 'status-on-time', icon: <CheckCircle2 size={11} /> },
    delayed: { label: 'DELAYED', cls: 'status-delayed', icon: <AlertTriangle size={11} /> },
    cancelled: { label: 'CANCELLED', cls: 'status-cancelled', icon: <XCircle size={11} /> },
};

const FlipText = ({ text }) => {
    const [displayed, setDisplayed] = useState(text);
    const [flipping, setFlipping] = useState(false);
    const prevRef = useRef(text);

    useEffect(() => {
        if (prevRef.current !== text) {
            setFlipping(true);
            const t = setTimeout(() => { setDisplayed(text); setFlipping(false); prevRef.current = text; }, 300);
            return () => clearTimeout(t);
        }
    }, [text]);

    return <span className={flipping ? 'fids-flip' : ''}>{displayed}</span>;
};

const LiveFlightBoard = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchFlights = async () => {
        try {
            const res = await api.get('/flights');
            setFlights(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchFlights();
        const interval = setInterval(fetchFlights, 30000);
        return () => clearInterval(interval);
    }, []);

    const filtered = filter === 'all' ? flights : flights.filter(f => f.status === filter);

    const counts = {
        all: flights.length,
        'on-time': flights.filter(f => f.status === 'on-time').length,
        delayed: flights.filter(f => f.status === 'delayed').length,
        cancelled: flights.filter(f => f.status === 'cancelled').length,
    };

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Radio size={14} style={{ color: '#0ea5e9' }} />
                        <span className="hud-label">LIVE FIDS DISPLAY</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="hud-label" style={{ color: '#10b981' }}>BROADCASTING</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Live Flight Board</h1>
                    <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
                        Auto-refreshes every 30s · Last updated {format(lastUpdated, 'HH:mm:ss')} UTC
                    </p>
                </div>
                <button onClick={fetchFlights} className="glass-button flex items-center gap-2">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { key: 'all', label: 'Total Flights', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
                    { key: 'on-time', label: 'On Time', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                    { key: 'delayed', label: 'Delayed', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                    { key: 'cancelled', label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                ].map(item => (
                    <div key={item.key} className="glass-card p-4 text-center cursor-pointer"
                        style={{ borderColor: `${item.color}20` }}
                        onClick={() => setFilter(item.key)}>
                        <p className="text-3xl font-bold" style={{ color: item.color }}>{counts[item.key]}</p>
                        <p className="hud-label mt-1">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {['all', 'on-time', 'delayed', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                        style={{
                            background: filter === f ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                            border: filter === f ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            color: filter === f ? '#0ea5e9' : '#475569'
                        }}>
                        <Filter size={11} /> {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>

            {/* FIDS Board */}
            <div className="glass-card overflow-hidden" style={{ boxShadow: '0 0 40px rgba(14,165,233,0.05)' }}>
                {/* Board Header */}
                <div className="px-6 py-4" style={{ background: 'rgba(14,165,233,0.06)', borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
                    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1.5fr 1.2fr 1.2fr 0.8fr 0.8fr 1fr' }}>
                        {['FLIGHT', 'ROUTE', 'DEPARTING', 'ARRIVING', 'GATE', 'CREW', 'STATUS'].map(h => (
                            <p key={h} className="hud-label">{h}</p>
                        ))}
                    </div>
                </div>

                {/* Board Rows */}
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    {loading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="px-6 py-4">
                                <div className="skeleton h-6 rounded-lg" />
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <Plane size={36} className="mx-auto mb-3 opacity-10" />
                            <p style={{ color: '#475569' }}>No flights for this filter</p>
                        </div>
                    ) : filtered.map((flight, idx) => {
                        const meta = STATUS_META[flight.status] || STATUS_META['on-time'];
                        const dur = ((new Date(flight.arrivalTime) - new Date(flight.departureTime)) / 3600000).toFixed(1);
                        return (
                            <div key={flight.id} className="fids-row px-6 py-4"
                                style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="grid gap-4 items-center"
                                    style={{ gridTemplateColumns: '1fr 1.5fr 1.2fr 1.2fr 0.8fr 0.8fr 1fr' }}>
                                    {/* Flight number */}
                                    <div>
                                        <span className="fids-code text-sm font-bold text-white">
                                            <FlipText text={flight.flightNumber} />
                                        </span>
                                        <p className="text-xs mt-0.5" style={{ color: '#334155' }}>{flight.aircraftType?.split(' ').slice(-1)}</p>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-2">
                                        <span className="fids-code text-sm text-white">{flight.origin}</span>
                                        <div className="flex-1 h-px" style={{ background: 'rgba(14,165,233,0.15)' }} />
                                        <Plane size={12} className="rotate-90 flex-shrink-0" style={{ color: '#0ea5e9' }} />
                                        <div className="flex-1 h-px" style={{ background: 'rgba(14,165,233,0.15)' }} />
                                        <span className="fids-code text-sm text-white">{flight.destination}</span>
                                    </div>

                                    {/* Departing */}
                                    <div>
                                        <p className="text-sm text-white font-medium">{format(new Date(flight.departureTime), 'HH:mm')}</p>
                                        <p className="text-xs" style={{ color: '#475569' }}>{format(new Date(flight.departureTime), 'MMM dd')}</p>
                                    </div>

                                    {/* Arriving */}
                                    <div>
                                        <p className="text-sm text-white font-medium">{format(new Date(flight.arrivalTime), 'HH:mm')}</p>
                                        <p className="text-xs" style={{ color: '#475569' }}>{format(new Date(flight.arrivalTime), 'MMM dd')}</p>
                                    </div>

                                    {/* Gate */}
                                    <div>
                                        <p className="fids-code text-sm font-bold" style={{ color: '#f59e0b' }}>
                                            {flight.gate || '—'}
                                        </p>
                                        <p className="text-xs" style={{ color: '#334155' }}>{flight.terminal?.split(' ').slice(0, 1)}</p>
                                    </div>

                                    {/* Crew */}
                                    <div className="flex items-center gap-1.5">
                                        <Users size={12} style={{ color: '#64748b' }} />
                                        <span className="text-sm font-bold" style={{ color: flight.schedules?.length > 0 ? '#34d399' : '#64748b' }}>
                                            {flight.schedules?.length || 0}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <span className={`status-badge ${meta.cls} w-fit`}>
                                        {meta.icon}
                                        <FlipText text={meta.label} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LiveFlightBoard;
