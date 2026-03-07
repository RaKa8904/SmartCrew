import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertTriangle, Clock, Users, Plane, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const ConflictViewer = () => {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/schedules/conflicts');
            setConflicts(res.data);
        } catch (err) {
            console.error('Failed to fetch conflicts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Conflict Viewer</h1>
                    <p className="text-slate-400 mt-1">Identify and resolve duty hour overlaps</p>
                </div>
                <button
                    onClick={fetchData}
                    className="glass-button flex items-center gap-2"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh Conflicts
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin inline text-primary-500" size={32} /></div>
            ) : conflicts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {conflicts.map((conflict, i) => (
                        <div key={i} className="glass-card p-8 border-l-4 border-amber-500 bg-amber-500/5">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className="shrink-0 p-4 bg-amber-500/20 rounded-2xl">
                                    <AlertTriangle className="text-amber-500" size={32} />
                                </div>

                                <div className="flex-1 space-y-6 w-full">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Duty Overlap Detected</h3>
                                        <p className="text-slate-400 text-sm">Crew member <span className="text-white font-bold">{conflict.crewName}</span> has overlapping flight assignments.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                            <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-3">Primary Flight</p>
                                            <div className="flex items-center gap-3">
                                                <Plane size={16} className="text-slate-500" />
                                                <span className="text-white font-bold">{conflict.flight1}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Clock size={16} className="text-slate-500" />
                                                <span className="text-xs text-slate-400">
                                                    {format(new Date(conflict.departureTime1), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Conflicting Flight(s)</p>
                                            <div className="flex items-center gap-3">
                                                <Plane size={16} className="text-slate-500" />
                                                <span className="text-white font-bold">{conflict.flight2}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Clock size={16} className="text-slate-500" />
                                                <span className="text-xs text-slate-400">
                                                    {conflict.departureTime2 ? format(new Date(conflict.departureTime2), 'MMM dd, HH:mm') : 'Unknown Time'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Ignore</button>
                                        <button
                                            onClick={() => window.location.href = '/generate'}
                                            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary-500/20"
                                        >
                                            Go to Auto Schedule Board
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-20 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Conflicts Detected</h3>
                    <p className="text-slate-400">All crew schedules are compliant with duty hour rules.</p>
                </div>
            )}
        </div>
    );
};

export default ConflictViewer;
