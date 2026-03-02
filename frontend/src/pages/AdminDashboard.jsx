import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useRules } from '../context/RulesContext';
import {
    Plane, Users, CheckCircle, AlertTriangle, TrendingUp,
    Settings, Download, ExternalLink, Activity, Clock, Radio
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = { 'on-time': '#10b981', delayed: '#f59e0b', cancelled: '#ef4444' };
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const duration = 600;
        const steps = 30;
        const step = value / steps;
        let current = 0;
        const t = setInterval(() => {
            current += step;
            if (current >= value) { setDisplay(value); clearInterval(t); }
            else setDisplay(Math.floor(current));
        }, duration / steps);
        return () => clearInterval(t);
    }, [value]);
    return <span>{display}</span>;
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { loading: rulesLoading, getRuleValue } = useRules();

    const [stats, setStats] = useState({ totalFlights: 0, totalCrew: 0, scheduledFlights: 0, conflicts: 0 });
    const [utilizationData, setUtilizationData] = useState([]);
    const [flights, setFlights] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [flightsRes, crewRes, conflictsRes, utilRes] = await Promise.all([
                    api.get('/flights'),
                    api.get('/crew'),
                    api.get('/schedules/conflicts'),
                    api.get('/reports/utilization'),
                ]);
                const allFlights = flightsRes.data;
                setFlights(allFlights);
                setStats({
                    totalFlights: allFlights.length,
                    totalCrew: crewRes.data.length,
                    scheduledFlights: allFlights.filter(f => f.schedules?.length > 0).length,
                    conflicts: conflictsRes.data.length,
                });
                setUtilizationData(utilRes.data.slice(0, 6));
                // Recent activity from schedules
                const recent = allFlights
                    .filter(f => f.schedules?.length > 0)
                    .slice(-5)
                    .reverse()
                    .map(f => ({
                        flight: f.flightNumber,
                        route: `${f.origin} → ${f.destination}`,
                        crew: f.schedules.length,
                        status: f.status,
                    }));
                setRecentActivity(recent);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        fetchData();
    }, []);

    // Pie data for flight status
    const statusCount = flights.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
    }, {});
    const pieData = [
        { name: 'On Time', value: statusCount['on-time'] || 0 },
        { name: 'Delayed', value: statusCount['delayed'] || 0 },
        { name: 'Cancelled', value: statusCount['cancelled'] || 0 },
    ];

    const statCards = [
        { label: 'Total Flights', value: stats.totalFlights, icon: <Plane size={20} />, accent: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)' },
        { label: 'Crew Members', value: stats.totalCrew, icon: <Users size={20} />, accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
        { label: 'Crew Assigned', value: stats.scheduledFlights, icon: <CheckCircle size={20} />, accent: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
        { label: 'Conflicts', value: stats.conflicts, icon: <AlertTriangle size={20} />, accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    ];

    const ruleCards = [
        { label: 'Max Daily Hours', value: getRuleValue('Max Daily Duty Hours', 12), unit: 'hrs', icon: '⏱' },
        { label: 'Min Rest Period', value: getRuleValue('Min Rest Period', 10), unit: 'hrs', icon: '🌙' },
        { label: 'Weekly Cap', value: getRuleValue('Max Weekly Duty Hours', 40), unit: 'hrs', icon: '📅' },
        { label: 'Min Crew/Flight', value: getRuleValue('Min Crew Per Flight', 3), unit: 'pers', icon: '👥' },
    ];

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="hud-label">OPERATIONS CENTER</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="hud-label" style={{ color: '#10b981' }}>LIVE</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                    <p className="mt-1" style={{ color: '#64748b' }}>Fleet & Crew Operational Overview</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/live-board')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
                        <Radio size={16} /> Live Board
                    </button>
                    <button className="glass-button flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="glass-card p-5 group cursor-default"
                        style={{ borderColor: card.border }}>
                        <div className="flex justify-between items-start mb-4">
                            <p className="hud-label">{card.label}</p>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                style={{ background: card.bg, color: card.accent }}>
                                {card.icon}
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white number-appear">
                            <AnimatedNumber value={card.value} />
                        </h3>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Utilization Bar */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <TrendingUp size={18} style={{ color: '#0ea5e9' }} />
                            Crew Utilization
                        </h3>
                        <span className="hud-label">TOP 6 MEMBERS</span>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={utilizationData} margin={{ top: 0, right: 8, left: -20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.06)" vertical={false} />
                                <XAxis dataKey="crewName" stroke="#334155" fontSize={10} tickLine={false} axisLine={false}
                                    angle={-30} textAnchor="end" interval={0} />
                                <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(14,165,233,0.2)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                    formatter={v => [`${v}%`, 'Utilization']} cursor={{ fill: 'rgba(14,165,233,0.04)' }} />
                                <Bar dataKey="utilizationPercent" fill="url(#utilGrad)" radius={[6, 6, 0, 0]} barSize={28} />
                                <defs>
                                    <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0ea5e9" />
                                        <stop offset="100%" stopColor="#0369a1" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Flight Status Pie */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Activity size={18} style={{ color: '#f59e0b' }} />
                            Flight Status
                        </h3>
                        <span className="hud-label">BREAKDOWN</span>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                                    paddingAngle={3} dataKey="value" stroke="none">
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={PIE_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(14,165,233,0.2)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Rules */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Settings size={18} style={{ color: '#0ea5e9' }} /> System Rules
                        </h3>
                        <button onClick={() => navigate('/rules')}
                            className="flex items-center gap-1 text-xs font-semibold transition-colors"
                            style={{ color: '#0ea5e9' }}>
                            <ExternalLink size={12} /> Manage
                        </button>
                    </div>
                    {rulesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(n => <div key={n} className="skeleton h-12 rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {ruleCards.map((r, i) => (
                                <div key={i} className="p-4 rounded-xl transition-all group cursor-pointer"
                                    style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.08)' }}
                                    onClick={() => navigate('/rules')}>
                                    <div className="text-lg mb-1">{r.icon}</div>
                                    <p className="hud-label mb-1">{r.label}</p>
                                    <p className="text-lg font-bold" style={{ color: '#0ea5e9' }}>
                                        {r.value}
                                        <span className="text-xs font-normal ml-1" style={{ color: '#475569' }}>{r.unit}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Clock size={18} style={{ color: '#0ea5e9' }} /> Recent Assignments
                        </h3>
                        <span className="hud-label">LATEST 5</span>
                    </div>
                    <div className="space-y-2">
                        {recentActivity.length === 0 ? (
                            <p className="text-center py-6" style={{ color: '#475569' }}>No recent assignments</p>
                        ) : recentActivity.map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex items-center gap-3">
                                    <span className="fids-code text-xs" style={{ color: '#0ea5e9' }}>{a.flight}</span>
                                    <span className="text-sm" style={{ color: '#94a3b8' }}>{a.route}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs" style={{ color: '#64748b' }}>{a.crew} crew</span>
                                    <span className={`status-badge status-${a.status}`}>
                                        {a.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
