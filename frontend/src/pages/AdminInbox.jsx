import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Check, X, RefreshCcw, UserCircle2, Hand } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const AdminInbox = () => {
    const [leaves, setLeaves] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('leaves');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leaveRes, swapRes, bidRes] = await Promise.all([
                api.get('/portal/admin/leave'),
                api.get('/portal/admin/swap'),
                api.get('/portal/admin/bids')
            ]);
            setLeaves(leaveRes.data);
            setSwaps(swapRes.data);
            setBids(bidRes.data);
        } catch (err) {
            console.error('Failed to fetch admin inbox data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLeave = async (id, status) => {
        try {
            await api.put(`/portal/admin/leave/${id}`, { status });
            fetchData();
        } catch (err) { alert('Error processing request.'); }
    };

    const handleSwap = async (id, status) => {
        try {
            await api.put(`/portal/admin/swap/${id}`, { status });
            fetchData();
        } catch (err) { alert('Error processing request.'); }
    };

    const handleBid = async (id) => {
        try {
            // award bid
            await api.put(`/portal/admin/bids/${id}/award`);
            fetchData();
        } catch (err) { alert('Error processing bid request.'); }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading Inbox...</div>;

    const pendingLeaves = leaves.filter(l => l.status === 'pending');
    const pendingSwaps = swaps.filter(s => s.status === 'pending_admin');
    const pendingBids = bids.filter(b => b.status === 'placed');

    return (
        <div className="space-y-6 page-enter">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Approval Inbox</h1>
                <p className="mt-1 text-slate-400">Manage Crew Portal Requests</p>
            </div>

            <div className="flex gap-2 p-1 glass-card w-fit rounded-xl overflow-hidden">
                {[
                    { id: 'leaves', label: `Time Off (${pendingLeaves.length})`, icon: <UserCircle2 size={14} /> },
                    { id: 'swaps', label: `Shift Swaps (${pendingSwaps.length})`, icon: <RefreshCcw size={14} /> },
                    { id: 'bids', label: `Active Bids (${pendingBids.length})`, icon: <Hand size={14} /> }
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

            <div className="glass-card p-6">
                {activeTab === 'leaves' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white mb-4">Pending Leave Requests</h3>
                        {pendingLeaves.length === 0 ? <p className="text-slate-500 text-sm italic">No pending requests.</p> :
                            <div className="grid gap-4">
                                {pendingLeaves.map(l => (
                                    <div key={l.id} className="flex justify-between items-center p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                                        <div>
                                            <p className="text-white font-semibold flex items-center gap-2">
                                                {l.crew.user.name} <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded uppercase">{l.crew.crewType}</span>
                                            </p>
                                            <p className="text-primary-400 text-sm">{format(new Date(l.startDate), 'MMM dd')} - {format(new Date(l.endDate), 'MMM dd, yyyy')}</p>
                                            <p className="text-slate-400 text-xs mt-1">Reason: {l.reason}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleLeave(l.id, 'approved')} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"><Check size={18} /></button>
                                            <button onClick={() => handleLeave(l.id, 'rejected')} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg"><X size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {activeTab === 'swaps' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white mb-4">Pending Swap Requests</h3>
                        {pendingSwaps.length === 0 ? <p className="text-slate-500 text-sm italic">No pending requests.</p> :
                            <div className="grid gap-4">
                                {pendingSwaps.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                                        <div>
                                            <p className="text-white text-sm">
                                                <span className="font-bold text-primary-400">{s.requestor.user.name}</span> wants to swap with <span className="font-bold text-primary-400">{s.targetCrew?.user?.name || 'Anyone'}</span>
                                            </p>
                                            <p className="text-slate-300 text-sm mt-1">Flight {s.schedule?.flight?.flightNumber} ({format(new Date(s.schedule?.flight?.departureTime || Date.now()), 'MMM d HH:mm')})</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSwap(s.id, 'approved')} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wide">Approve & Update Schedule</button>
                                            <button onClick={() => handleSwap(s.id, 'rejected')} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wide">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {activeTab === 'bids' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-white mb-4">Open Bids vs Pool</h3>
                        {pendingBids.length === 0 ? <p className="text-slate-500 text-sm italic">No pending bids.</p> :
                            <div className="grid gap-4">
                                {pendingBids.map(b => (
                                    <div key={b.id} className="flex justify-between items-center p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                                        <div>
                                            <p className="text-white font-semibold">{b.crew.user.name} <span className="text-[10px] ml-2 text-slate-400">Bid Placed {formatDistanceToNow(new Date(b.bidTimestamp))} ago</span></p>
                                            <p className="text-primary-400 text-sm">{b.flight.flightNumber} ({b.flight.origin} → {b.flight.destination})</p>
                                        </div>
                                        <button onClick={() => handleBid(b.id)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wide">Award Shift</button>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInbox;
