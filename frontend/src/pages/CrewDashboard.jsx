import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Plane, CheckCircle2, Award, AlertCircle, RefreshCcw, Hand, UserCircle2 } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('schedule');
    const [leaveFilter, setLeaveFilter] = useState('active'); // 'active' or 'history'
    const [swapFilter, setSwapFilter] = useState('active'); // 'active' or 'history'

    // Portal Data State
    const [leaves, setLeaves] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [bids, setBids] = useState([]);
    const [openFlights, setOpenFlights] = useState([]);

    // Forms state
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [swapModal, setSwapModal] = useState({ open: false, scheduleId: null, flightNumber: '', targetUserId: '' });

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [crewRes, leaveRes, swapRes, bidRes, flightsRes] = await Promise.all([
                api.get('/crew/me'),
                api.get('/portal/leave/my-requests').catch(() => ({ data: [] })),
                api.get('/portal/swap/my-requests').catch(() => ({ data: [] })),
                api.get('/portal/bid/my-bids').catch(() => ({ data: [] })),
                api.get('/flights')
            ]);
            setCrewDetails(crewRes.data);
            setLeaves(leaveRes.data);
            setSwaps(swapRes.data);
            setBids(bidRes.data);

            // Open flights = no schedule assigned
            const upcomingOpen = (flightsRes.data || [])
                .filter(f => (!f.schedules || f.schedules.length === 0) && new Date(f.departureTime) > new Date())
                .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
            setOpenFlights(upcomingOpen);
        } catch (err) {
            console.error('Failed to fetch crew portal data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [user.id]);

    const handleRequestLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/portal/leave', leaveForm);
            alert('Leave request submitted successfully.');
            setLeaveForm({ startDate: '', endDate: '', reason: '' });
            fetchAllData();
        } catch (error) {
            alert('Error submitting request: ' + error.message);
        }
    };

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

            {/* Portal Navigation Tabs */}
            <div className="flex gap-2 p-1 glass-card w-fit rounded-xl overflow-hidden">
                {[
                    { id: 'schedule', label: 'My Schedule', icon: <Calendar size={14} /> },
                    { id: 'leaves', label: 'Time Off Requests', icon: <UserCircle2 size={14} /> },
                    { id: 'swaps', label: 'Shift Swaps & Bids', icon: <RefreshCcw size={14} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Area based on Active Tab */}
                <div className="lg:col-span-2 space-y-4">

                    {/* SCHEDULE TAB */}
                    {activeTab === 'schedule' && (
                        <>
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
                                                            {!isPast && (
                                                                <button
                                                                    title="Request Swap"
                                                                    onClick={() => setSwapModal({ open: true, scheduleId: schedule.id, flightNumber: schedule.flight.flightNumber, targetUserId: '' })}
                                                                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                                                                >
                                                                    <RefreshCcw size={14} />
                                                                </button>
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
                        </>
                    )}

                    {/* LEAVES TAB */}
                    {activeTab === 'leaves' && (
                        <div className="space-y-6">
                            <div className="glass-card p-6">
                                <h3 className="font-bold text-white mb-4">Request Time Off</h3>
                                <form onSubmit={handleRequestLeave} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="hud-label text-xs mb-1 block">Start Date</label>
                                            <input type="date" required className="avio-input w-full" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="hud-label text-xs mb-1 block">End Date</label>
                                            <input type="date" required className="avio-input w-full" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="hud-label text-xs mb-1 block">Reason</label>
                                        <input type="text" placeholder="e.g. Medical leave, Annual vacation" required className="avio-input w-full" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                                    </div>
                                    <button type="submit" className="glass-button w-full">Submit Request</button>
                                </form>
                            </div>

                            <div className="glass-card">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Leave Requests</h3>
                                    <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
                                        <button 
                                            onClick={() => setLeaveFilter('active')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${leaveFilter === 'active' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Active
                                        </button>
                                        <button 
                                            onClick={() => setLeaveFilter('history')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${leaveFilter === 'history' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            History
                                        </button>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto custom-scrollbar">
                                    {leaves.filter(l => leaveFilter === 'active' ? l.status === 'pending' : l.status !== 'pending').length === 0 ? (
                                        <p className="p-4 text-slate-500 text-sm italic">No {leaveFilter} leave requests found.</p>
                                    ) : leaves.filter(l => leaveFilter === 'active' ? l.status === 'pending' : l.status !== 'pending').map(l => (
                                        <div key={l.id} className="p-4 flex justify-between items-center group hover:bg-white/[0.02]">
                                            <div>
                                                <p className="text-white text-sm font-semibold">{format(new Date(l.startDate), 'MMM dd')} - {format(new Date(l.endDate), 'MMM dd, yyyy')}</p>
                                                <p className="text-xs text-slate-400 mt-1">{l.reason}</p>
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : l.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {l.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SWAPS AND BIDS TAB */}
                    {activeTab === 'swaps' && (
                        <div className="space-y-6">
                            <div className="glass-card">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                        <Hand size={14} /> My Shift Bids
                                    </h3>
                                    <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
                                        <button 
                                            onClick={() => setSwapFilter('active')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${swapFilter === 'active' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Active
                                        </button>
                                        <button 
                                            onClick={() => setSwapFilter('history')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${swapFilter === 'history' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            History
                                        </button>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                                    {bids.filter(b => swapFilter === 'active' ? b.status === 'pending' : b.status !== 'pending').length === 0 ? (
                                        <p className="p-4 text-slate-500 text-sm italic">No {swapFilter} bids found.</p>
                                    ) : bids.filter(b => swapFilter === 'active' ? b.status === 'pending' : b.status !== 'pending').map(bid => (
                                        <div key={bid.id} className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-white text-sm font-semibold flex items-center justify-start gap-2">
                                                    <span className="text-primary-400">{bid.flight.flightNumber}</span>
                                                    {bid.flight.origin} → {bid.flight.destination}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{format(new Date(bid.flight.departureTime), 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${bid.status === 'won' ? 'bg-emerald-500/10 text-emerald-400' : bid.status === 'lost' ? 'bg-slate-500/10 text-slate-400' : 'bg-primary-500/10 text-primary-400'}`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                        <Plane size={14} /> Available Flights (Open Bidding)
                                    </h3>
                                </div>
                                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                                    {openFlights.length === 0 ? (
                                        <p className="p-4 text-slate-500 text-sm italic">No open flights currently available for bidding.</p>
                                    ) : openFlights.map(flight => {
                                        // Check if already bid
                                        const alreadyBid = bids.find(b => b.flightId === flight.id);
                                        return (
                                            <div key={flight.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                                                <div>
                                                    <p className="text-white text-sm font-semibold flex items-center justify-start gap-2">
                                                        <span className="text-primary-400">{flight.flightNumber}</span>
                                                        {flight.origin} → {flight.destination}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">{format(new Date(flight.departureTime), 'MMM dd, yyyy HH:mm')}</p>
                                                </div>
                                                {alreadyBid ? (
                                                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                                                        Bid Placed
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.post('/portal/bid', { flightId: flight.id });
                                                                fetchAllData();
                                                            } catch (err) { alert('Failed to place bid'); }
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 font-bold tracking-wide"
                                                    >
                                                        Place Bid
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="glass-card">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                        <RefreshCcw size={14} /> My Swap Requests
                                    </h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {swaps.filter(s => swapFilter === 'active' ? ['pending_peer', 'pending_admin'].includes(s.status) : ['approved', 'rejected', 'cancelled'].includes(s.status)).length === 0 ? (
                                        <p className="p-4 text-slate-500 text-sm italic">No {swapFilter} swap requests.</p>
                                    ) : swaps.filter(s => swapFilter === 'active' ? ['pending_peer', 'pending_admin'].includes(s.status) : ['approved', 'rejected', 'cancelled'].includes(s.status)).map(swap => {
                                        const isRequestor = swap.requestorId === crewDetails?.id;
                                        return (
                                            <div key={swap.id} className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-white text-sm font-semibold">
                                                        {swap.schedule.flight.flightNumber} ({format(new Date(swap.schedule.flight.departureTime), 'MMM dd')})
                                                    </p>
                                                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                                                        {swap.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {isRequestor ? 'You requested to swap with ' : 'Swap requested from '}
                                                    <span className="text-white font-medium">
                                                        {isRequestor ? (swap.targetCrew?.user?.name || 'Open Pool') : swap.requestor?.user?.name}
                                                    </span>
                                                </p>
                                                {/* Actions if we are the target and it's pending_peer */}
                                                {!isRequestor && swap.status === 'pending_peer' && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={async () => {
                                                                await api.put(`/portal/swap/${swap.id}/respond`, { accept: true });
                                                                fetchAllData();
                                                            }}
                                                            className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 font-bold"
                                                        >Accept</button>
                                                        <button
                                                            onClick={async () => {
                                                                await api.put(`/portal/swap/${swap.id}/respond`, { accept: false });
                                                                fetchAllData();
                                                            }}
                                                            className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 font-bold"
                                                        >Decline</button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
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

            {/* Swap Request Modal */}
            {swapModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-md p-6 relative shadow-2xl border border-white/10">
                        <button onClick={() => setSwapModal({ open: false, scheduleId: null, flightNumber: '', targetUserId: '' })} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <AlertCircle size={20} className="rotate-45" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <RefreshCcw size={18} className="text-primary-400" /> Request Swap
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">Drop or swap your assignment for Flight <span className="text-white font-bold">{swapModal.flightNumber}</span>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="hud-label text-xs mb-1 block">Target Crew User ID (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Leave blank for an open pool drop"
                                    className="avio-input w-full"
                                    value={swapModal.targetUserId}
                                    onChange={(e) => setSwapModal({ ...swapModal, targetUserId: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-500 mt-1">If blank, Schedulers will attempt to reassign it.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setSwapModal({ open: false, scheduleId: null, flightNumber: '', targetUserId: '' })}
                                    className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const payload = { scheduleId: swapModal.scheduleId };
                                            if (swapModal.targetUserId) payload.targetUserId = parseInt(swapModal.targetUserId);

                                            await api.post('/portal/swap', payload);
                                            alert(`Swap request for ${swapModal.flightNumber} submitted.`);
                                            setSwapModal({ open: false, scheduleId: null, flightNumber: '', targetUserId: '' });
                                            fetchAllData();
                                            setActiveTab('swaps');
                                        } catch (err) {
                                            alert(err?.response?.data?.message || 'Failed to submit swap request.');
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded-lg text-sm font-bold transition-all"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrewDashboard;
