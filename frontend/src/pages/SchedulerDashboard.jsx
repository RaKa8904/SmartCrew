import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Plus, Play, AlertCircle, RefreshCw,
    CheckCircle2, Clock, Users, Plane
} from 'lucide-react';
import { format } from 'date-fns';

const SchedulerDashboard = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/flights');
            setFlights(res.data);
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAutoGenerate = async () => {
        setGenerating(true);
        try {
            await api.post('/schedules/generate');
            await fetchData();
        } catch (err) {
            alert('Generation failed: ' + (err.response?.data?.message || 'Server error'));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Scheduler Portal</h1>
                    <p className="text-slate-400 mt-1">Automated AI-assisted crew assignment</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleAutoGenerate}
                        disabled={generating}
                        className="glass-button flex items-center gap-2 bg-primary-600 hover:bg-primary-500 shadow-xl shadow-primary-500/20"
                    >
                        {generating ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                        {generating ? 'Processing...' : 'Auto-Generate Schedule'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <p className="text-slate-400 text-sm font-medium">Pending Assignment</p>
                    <h3 className="text-3xl font-bold text-white mt-1">
                        {flights.filter(f => f.schedules.length === 0).length}
                    </h3>
                </div>
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                    <p className="text-slate-400 text-sm font-medium">Fully Scheduled</p>
                    <h3 className="text-3xl font-bold text-white mt-1">
                        {flights.filter(f => f.schedules.length > 0).length}
                    </h3>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <p className="text-slate-400 text-sm font-medium">System Health</p>
                    <h3 className="text-3xl font-bold text-white mt-1">Optimal</h3>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plane className="text-primary-500" size={20} />
                        Flight Queue
                    </h3>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-slate-400 border border-white/5">Filter by Date</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Flight ID</th>
                                <th className="px-6 py-4 font-semibold">Route</th>
                                <th className="px-6 py-4 font-semibold">Departure</th>
                                <th className="px-6 py-4 font-semibold">Crew Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {flights.map((flight) => (
                                <tr key={flight.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-white group-hover:text-primary-400 transition-colors uppercase">
                                            {flight.flightNumber}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">{flight.aircraftType}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">{flight.origin}</span>
                                            <ArrowRightIcon size={12} className="text-slate-600" />
                                            <span className="text-white font-medium">{flight.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <p className="text-sm">{format(new Date(flight.departureTime), 'MMM dd')}</p>
                                        <p className="text-xs text-slate-500">{format(new Date(flight.departureTime), 'HH:mm')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {flight.schedules.length > 0 ? (
                                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
                                                <CheckCircle2 size={14} />
                                                <span className="text-xs font-bold uppercase tracking-tight">Assigned</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full w-fit">
                                                <AlertCircle size={14} />
                                                <span className="text-xs font-bold uppercase tracking-tight">Pending</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-500 hover:text-primary-400 text-sm font-semibold transition-colors">
                                            Quick Assign
                                        </button>
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

const ArrowRightIcon = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

export default SchedulerDashboard;
