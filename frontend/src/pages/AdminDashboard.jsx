import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Plane, Users, CheckCircle, AlertTriangle,
    TrendingUp, Calendar as CalendarIcon, Download
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalFlights: 0,
        totalCrew: 0,
        scheduledFlights: 0,
        conflicts: 0
    });
    const [utilizationData, setUtilizationData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [flightsRes, crewRes, conflictsRes, utilRes] = await Promise.all([
                    api.get('/flights'),
                    api.get('/crew'),
                    api.get('/schedules/conflicts'),
                    api.get('/reports/utilization')
                ]);

                setStats({
                    totalFlights: flightsRes.data.length,
                    totalCrew: crewRes.data.length,
                    scheduledFlights: flightsRes.data.filter(f => f.schedules.length > 0).length,
                    conflicts: conflictsRes.data.length
                });

                setUtilizationData(utilRes.data.slice(0, 5)); // Just top 5 for the chart
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Flights', value: stats.totalFlights, icon: <Plane size={24} />, color: 'bg-blue-500' },
        { label: 'Total Crew', value: stats.totalCrew, icon: <Users size={24} />, color: 'bg-purple-500' },
        { label: 'Scheduled', value: stats.scheduledFlights, icon: <CheckCircle size={24} />, color: 'bg-emerald-500' },
        { label: 'Conflicts', value: stats.conflicts, icon: <AlertTriangle size={24} />, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-1">Fleet and Crew Operational Overview</p>
                </div>
                <button className="glass-button flex items-center gap-2">
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="glass-card p-6 flex items-center justify-between group hover:border-primary-500/50 transition-all duration-300">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
                        </div>
                        <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Utilization Chart */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-primary-500" size={20} />
                            Crew Utilization
                        </h3>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top 5 Members</span>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={utilizationData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="crewName" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="utilization" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Quick Actions */}
                <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-8">
                        <CalendarIcon className="text-primary-500" size={20} />
                        System Rules
                    </h3>
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">Max Daily Hours</p>
                                <p className="text-xs text-slate-400">Current limit: 12 hours</p>
                            </div>
                            <button className="text-primary-500 text-sm font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">Min Rest Hours</p>
                                <p className="text-xs text-slate-400">Current limit: 10 hours</p>
                            </div>
                            <button className="text-primary-500 text-sm font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">Weekly Cap</p>
                                <p className="text-xs text-slate-400">Current limit: 40 hours</p>
                            </div>
                            <button className="text-primary-500 text-sm font-semibold hover:underline">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
