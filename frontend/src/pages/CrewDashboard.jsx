import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Plane, CheckCircle2, Award, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const getDutyColor = (pct) => {
    if (pct >= 85) return { bar: 'linear-gradient(90deg, #dc2626, #ef4444)', label: '#f87171', glow: 'rgba(239,68,68,0.5)' };
    if (pct >= 60) return { bar: 'linear-gradient(90deg, #b45309, #f59e0b)', label: '#fbbf24', glow: 'rgba(245,158,11,0.5)' };
    return { bar: 'linear-gradient(90deg, #059669, #10b981)', label: '#34d399', glow: 'rgba(16,185,129,0.5)' };
};

const CrewDashboard = () => {
    const { user } = useAuth();
    const [crewDetails, setCrewDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrewData = async () => {
            try {
                const res = await api.get('/crew/me');
                setCrewDetails(res.data);
            } catch (err) {
                console.error('Failed to fetch crew data', err);
            } finally { setLoading(false); }
        };
        fetchCrewData();
    }, [user.id]);

    if (loading) return (
        <div className="space-y-4 page-enter">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
    );

    const schedules = crewDetails?.schedules || [];
    const totalHours = schedules.reduce((acc, s) => {
        const d = (new Date(s.flight.arrivalTime) - new Date(s.flight.departureTime)) / 3600000;
        return acc + d;
    }, 0);
    const maxHours = crewDetails?.maxHoursPerWeek || 40;
    const dutyPct = Math.min((totalHours / maxHours) * 100, 100);
    const dutyColor = getDutyColor(dutyPct);

    const nextFlight = schedules.find(s => new Date(s.flight.departureTime) > new Date());

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="hud-label">CREW MEMBER PORTAL</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {user.name}</h1>
                    <p className="mt-1" style={{ color: '#64748b' }}>
                        {crewDetails?.crewType === 'pilot' ? '✈️ ' : '🛎️ '}{crewDetails?.qualification}
                    </p>
                </div>
                {nextFlight && (
                    <div className="glass-card p-4 text-right" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                        <p className="hud-label mb-1" style={{ color: '#b45309' }}>NEXT FLIGHT</p>
                        <p className="fids-code text-lg font-bold text-white">{nextFlight.flight.flightNumber}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>
                            {formatDistanceToNow(new Date(nextFlight.flight.departureTime), { addSuffix: true })}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Flights */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} style={{ color: '#0ea5e9' }} />
                        <h3 className="font-bold text-white">Upcoming Assignments</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>
                            {schedules.length} flights
                        </span>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="glass-card p-16 text-center">
                            <Plane size={36} className="mx-auto mb-3 opacity-20" />
                            <p style={{ color: '#475569' }}>No flights scheduled at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedules.map((schedule) => {
                                const dur = ((new Date(schedule.flight.arrivalTime) - new Date(schedule.flight.departureTime)) / 3600000).toFixed(1);
                                const isPast = new Date(schedule.flight.departureTime) < new Date();
                                return (
                                    <div key={schedule.id} className="boarding-pass group" style={{ opacity: isPast ? 0.6 : 1 }}>
                                        <div className="px-5 pt-4 pb-3">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="fids-code text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)' }}>
                                                        {schedule.flight.flightNumber}
                                                    </span>
                                                    <span className="text-xs" style={{ color: '#475569' }}>
                                                        <Clock size={11} className="inline mr-1" />{dur}h duty
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold" style={{ color: '#94a3b8' }}>
                                                        {format(new Date(schedule.flight.departureTime), 'MMM dd, yyyy')}
                                                    </span>
                                                    {isPast && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                                                            <CheckCircle2 size={10} className="inline mr-1" />Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="fids-code text-2xl font-bold text-white">{schedule.flight.origin}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                                                        {format(new Date(schedule.flight.departureTime), 'HH:mm')} LT
                                                    </p>
                                                </div>

                                                <div className="flex-1 mx-6 flex flex-col items-center gap-1">
                                                    <div className="w-full flex items-center gap-1">
                                                        <div className="h-px flex-1" style={{ background: 'rgba(14,165,233,0.2)' }} />
                                                        <Plane size={14} className="rotate-90" style={{ color: '#0ea5e9' }} />
                                                        <div className="h-px flex-1" style={{ background: 'rgba(14,165,233,0.2)' }} />
                                                    </div>
                                                    <p className="text-xs" style={{ color: '#334155' }}>{schedule.flight.aircraftType}</p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="fids-code text-2xl font-bold text-white">{schedule.flight.destination}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                                                        {format(new Date(schedule.flight.arrivalTime), 'HH:mm')} LT
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Duty Summary */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Clock size={16} style={{ color: '#0ea5e9' }} /> Duty Summary
                            </h3>
                            {dutyPct >= 85 && (
                                <AlertCircle size={16} style={{ color: '#f87171' }} />
                            )}
                        </div>

                        <div className="mb-5">
                            <div className="flex justify-between text-sm mb-2.5">
                                <span style={{ color: '#64748b' }}>Weekly Hours Used</span>
                                <span className="font-bold" style={{ color: dutyColor.label }}>
                                    {totalHours.toFixed(1)} / {maxHours}h
                                </span>
                            </div>
                            <div className="duty-bar">
                                <div className="duty-bar-fill" style={{ width: `${dutyPct}%`, background: dutyColor.bar, boxShadow: `0 0 8px ${dutyColor.glow}` }} />
                            </div>
                            <p className="text-xs mt-1 text-right" style={{ color: '#475569' }}>
                                {(maxHours - totalHours).toFixed(1)}h remaining
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between p-3 rounded-xl"
                                style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.08)' }}>
                                <span className="text-sm" style={{ color: '#64748b' }}>Total Flights</span>
                                <span className="font-bold text-white">{schedules.length}</span>
                            </div>
                            <div className="flex justify-between p-3 rounded-xl"
                                style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.08)' }}>
                                <span className="text-sm" style={{ color: '#64748b' }}>Qualification</span>
                                <span className="font-bold text-white text-xs text-right max-w-[100px]">{crewDetails?.qualification}</span>
                            </div>
                        </div>

                        {dutyPct < 85 && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl"
                                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                                <div>
                                    <p className="text-xs font-semibold" style={{ color: '#34d399' }}>Compliant</p>
                                    <p className="text-xs" style={{ color: '#475569' }}>Rest requirements met</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Crew Badge */}
                    <div className="glass-card p-5" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-bold"
                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                                {user?.name?.[0]}
                            </div>
                            <p className="font-bold text-white">{user?.name}</p>
                            <p className="text-xs mt-1 capitalize" style={{ color: '#64748b' }}>
                                {crewDetails?.crewType} • {crewDetails?.status}
                            </p>
                            <div className="mt-3 flex items-center justify-center gap-1">
                                <Award size={14} style={{ color: '#f59e0b' }} />
                                <span className="text-xs" style={{ color: '#f59e0b' }}>{crewDetails?.qualification}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrewDashboard;
