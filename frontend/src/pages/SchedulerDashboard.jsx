import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Play, AlertCircle, RefreshCw, CheckCircle2, Clock,
    Users, Plane, Zap, Radio, Calendar
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';

const SchedulerDashboard = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/flights');
            setFlights(res.data);
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAutoGenerate = async () => {
        setGenerating(true);
        setSuccess('');
        try {
            const res = await api.post('/schedules/generate');
            await fetchData();
            setSuccess(
                res.data.flightsScheduled > 0
                    ? `✅ ${res.data.flightsScheduled} flights assigned crew (${res.data.assignmentsMade} assignments made)`
                    : '⚠️ All flights already scheduled or no available crew found.'
            );
            setTimeout(() => setSuccess(''), 6000);
        } catch (err) {
            alert('Generation failed: ' + (err.response?.data?.message || 'Server error'));
        } finally { setGenerating(false); }
    };

    const pending = flights.filter(f => f.schedules?.length === 0);
    const scheduled = flights.filter(f => f.schedules?.length > 0);
    const schedulePct = flights.length > 0 ? Math.round((scheduled.length / flights.length) * 100) : 0;

    // Group by date
    const groupedByDate = flights.reduce((acc, f) => {
        const day = format(new Date(f.departureTime), 'yyyy-MM-dd');
        if (!acc[day]) acc[day] = [];
        acc[day].push(f);
        return acc;
    }, {});

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} style={{ color: '#f59e0b' }} />
                        <span className="hud-label">AUTO-SCHEDULING ENGINE</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Scheduler Portal</h1>
                    <p className="mt-1" style={{ color: '#64748b' }}>AI-assisted crew assignment & optimization</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleAutoGenerate} disabled={generating} className="glass-button gap-2">
                        {generating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                        {generating ? 'Processing...' : 'Auto-Generate Schedule'}
                    </button>
                </div>
            </div>

            {/* Success Toast */}
            {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                    <CheckCircle2 size={18} />
                    <span className="font-semibold">{success}</span>
                </div>
            )}

            {/* Stats + Progress */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-5" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                        <span className="hud-label">PENDING</span>
                    </div>
                    <p className="text-4xl font-bold text-white">{pending.length}</p>
                    <p className="text-sm mt-1" style={{ color: '#64748b' }}>Await crew assignment</p>
                </div>
                <div className="glass-card p-5" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                        <span className="hud-label">SCHEDULED</span>
                    </div>
                    <p className="text-4xl font-bold text-white">{scheduled.length}</p>
                    <p className="text-sm mt-1" style={{ color: '#64748b' }}>Crew confirmed</p>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Radio size={16} style={{ color: '#0ea5e9' }} />
                        <span className="hud-label">COMPLETION</span>
                    </div>
                    <p className="text-4xl font-bold text-white">{schedulePct}%</p>
                    <div className="mt-3 duty-bar">
                        <div className="duty-bar-fill" style={{
                            width: `${schedulePct}%`,
                            background: schedulePct === 100 ? 'linear-gradient(90deg, #059669, #10b981)' :
                                schedulePct > 60 ? 'linear-gradient(90deg, #0369a1, #0ea5e9)' :
                                    'linear-gradient(90deg, #b45309, #f59e0b)'
                        }} />
                    </div>
                </div>
            </div>

            {/* Flight Timeline by Date */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(14,165,233,0.08)' }}>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar size={18} style={{ color: '#0ea5e9' }} />
                        Flight Schedule Timeline
                    </h3>
                    <span className="hud-label">{flights.length} TOTAL FLIGHTS</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="avio-table">
                        <thead>
                            <tr>
                                <th>FLIGHT</th>
                                <th>ROUTE</th>
                                <th>DATE</th>
                                <th>DEPARTURE</th>
                                <th>AIRCRAFT</th>
                                <th>CREW STATUS</th>
                                <th className="text-right">CREW COUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7}><div className="skeleton h-6 rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : flights.map((flight) => (
                                <tr key={flight.id}>
                                    <td>
                                        <span className="fids-code text-sm font-bold text-white">{flight.flightNumber}</span>
                                        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{flight.status}</p>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="fids-code text-sm text-white">{flight.origin}</span>
                                            <Plane size={12} className="rotate-90" style={{ color: '#0ea5e9' }} />
                                            <span className="fids-code text-sm text-white">{flight.destination}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm text-white">{format(new Date(flight.departureTime), 'MMM dd')}</p>
                                    </td>
                                    <td>
                                        <p className="text-sm text-white font-medium">{format(new Date(flight.departureTime), 'HH:mm')}</p>
                                    </td>
                                    <td>
                                        <p className="text-sm" style={{ color: '#94a3b8' }}>{flight.aircraftType}</p>
                                    </td>
                                    <td>
                                        {flight.schedules?.length > 0 ? (
                                            <div className="flex items-center gap-1.5 status-on-time status-badge w-fit">
                                                <CheckCircle2 size={11} /> ASSIGNED
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 status-delayed status-badge w-fit">
                                                <AlertCircle size={11} /> PENDING
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Users size={13} style={{ color: '#475569' }} />
                                            <span className="text-sm font-bold" style={{ color: flight.schedules?.length > 0 ? '#34d399' : '#64748b' }}>
                                                {flight.schedules?.length || 0}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchedulerDashboard;
