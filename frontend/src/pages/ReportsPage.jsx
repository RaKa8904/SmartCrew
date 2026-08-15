import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    FileText, Download, TrendingUp, Users, Calendar, Loader2, X,
    Search, AlertTriangle, Activity, Eye, CheckCircle2, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';

const ReportsPage = () => {
    const [utilization, setUtilization] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States: null | 'workload' | 'assignments' | 'trends'
    const [activeModal, setActiveModal] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Data for Modals
    const [assignmentsData, setAssignmentsData] = useState([]);
    const [assignmentSearch, setAssignmentSearch] = useState('');
    const [analyticsData, setAnalyticsData] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get('/reports/utilization');
            setUtilization(res.data);
        } catch (err) {
            console.error('Failed to fetch utilization', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 1. Crew Workload Download
    const handleDownloadWorkload = async () => {
        try {
            const response = await api.get('/reports/workload/download', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'workload_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Workload report download failed');
        }
    };

    // 2. Flight Assignments Download & Preview Handlers
    const handleDownloadFlightAssignments = async () => {
        try {
            const response = await api.get('/reports/assignments/download', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'flight_assignments_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download flight assignments report', err);
            alert('Flight assignments CSV download failed');
        }
    };

    const handlePreviewFlightAssignments = async () => {
        setModalLoading(true);
        setActiveModal('assignments');
        try {
            const statsRes = await api.get('/reports/assignments');
            setAssignmentsData(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch flight assignments preview', err);
            alert('Flight assignments preview failed to load');
        } finally {
            setModalLoading(false);
        }
    };

    // 3. Utilization Trends & Analytics Modal
    const handleViewUtilizationTrends = async () => {
        setModalLoading(true);
        setActiveModal('trends');
        try {
            const res = await api.get('/reports/advanced');
            setAnalyticsData(res.data);
        } catch (err) {
            console.error('Failed to fetch advanced analytics', err);
            alert('Failed to load analytics trends');
        } finally {
            setModalLoading(false);
        }
    };

    const filteredUtilization = utilization.filter(row =>
        row.crewName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.crewType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAssignments = assignmentsData.filter(f =>
        f.flightNumber.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        f.origin.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        f.destination.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        f.aircraftType.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        f.assignedPilots.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
        f.assignedCabinCrew.toLowerCase().includes(assignmentSearch.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Reports</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Operational data, flight assignments, and crew utilization analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadWorkload}
                        className="glass-button !py-1.5 !px-3 !text-xs flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 shadow-md"
                    >
                        <Download size={14} />
                        Export Workload CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Utilization Table (takes 3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-primary-500" size={16} />
                                Crew Utilization Table
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                <input
                                    type="text"
                                    placeholder="Filter by crew name or role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 rounded-lg pl-8 pr-3 py-1 focus:outline-none focus:border-primary-500 w-full sm:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider border-b border-white/5">
                                        <th className="px-4 py-2.5 font-semibold">Crew Member</th>
                                        <th className="px-4 py-2.5 font-semibold">Type</th>
                                        <th className="px-4 py-2.5 font-semibold">Total Flights</th>
                                        <th className="px-4 py-2.5 font-semibold">Total Hours</th>
                                        <th className="px-4 py-2.5 font-semibold">Weekly Avg</th>
                                        <th className="px-4 py-2.5 font-semibold font-bold">Utilization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-16 text-center">
                                                <Loader2 className="animate-spin inline text-primary-500" size={24} />
                                            </td>
                                        </tr>
                                    ) : filteredUtilization.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-16 text-center text-slate-500">
                                                No crew utilization data available.
                                            </td>
                                        </tr>
                                    ) : filteredUtilization.map((row, i) => {
                                        const pct = row.utilizationPercent ?? parseFloat(row.utilization);
                                        let barColor = "bg-emerald-500";
                                        let badgeColor = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
                                        if (pct > 80) {
                                            barColor = "bg-rose-500";
                                            badgeColor = "text-rose-400 bg-rose-500/10 border border-rose-500/20";
                                        } else if (pct < 30) {
                                            barColor = "bg-sky-400";
                                            badgeColor = "text-sky-400 bg-sky-500/10 border border-sky-500/20";
                                        }

                                        return (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3 font-bold text-white uppercase tracking-tight">{row.crewName}</td>
                                                <td className="px-4 py-3 text-slate-400 capitalize">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${row.crewType === 'pilot' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                                        {row.crewType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-200 font-mono">{row.totalFlights}</td>
                                                <td className="px-4 py-3 text-slate-200 font-mono">{row.totalHours} hrs</td>
                                                <td className="px-4 py-3 text-slate-400 font-mono">{row.weeklyAvgHours ? `${row.weeklyAvgHours} hrs/wk` : '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                                                        </div>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badgeColor}`}>{row.utilization}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Available Reports Cards */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Crew Workload */}
                    <div className="glass-card p-4 border-l-2 border-emerald-500 hover:border-emerald-400 transition-all group">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <Users className="text-emerald-500" size={18} />
                                <h3 className="font-bold text-xs text-white">Crew Workload</h3>
                            </div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/20">Active</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Detailed breakdown of flight hours per crew member, including overtime and weekly duty limits.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadWorkload}
                                className="text-emerald-400 hover:text-emerald-300 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                                Generate CSV &rarr;
                            </button>
                            <span className="text-slate-600">|</span>
                            <button
                                onClick={() => setActiveModal('workload')}
                                className="text-slate-400 hover:text-slate-200 text-xs font-medium hover:underline flex items-center gap-1"
                            >
                                <Eye size={12} /> Preview
                            </button>
                        </div>
                    </div>

                    {/* Flight Assignments */}
                    <div className="glass-card p-4 border-l-2 border-blue-500 hover:border-blue-400 transition-all group">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <FileText className="text-blue-500" size={18} />
                                <h3 className="font-bold text-xs text-white">Flight Assignments</h3>
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-semibold border border-blue-500/20">Active</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Comprehensive list of all flight routes and assigned crew, categorized by aircraft type.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadFlightAssignments}
                                className="text-blue-400 hover:text-blue-300 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                                Generate CSV &rarr;
                            </button>
                            <span className="text-slate-600">|</span>
                            <button
                                onClick={handlePreviewFlightAssignments}
                                className="text-slate-400 hover:text-slate-200 text-xs font-medium hover:underline flex items-center gap-1"
                            >
                                <Eye size={12} /> Preview
                            </button>
                        </div>
                    </div>

                    {/* Utilization Trends */}
                    <div className="glass-card p-4 border-l-2 border-purple-500 hover:border-purple-400 transition-all group">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-purple-500" size={18} />
                                <h3 className="font-bold text-xs text-white">Utilization Trends</h3>
                            </div>
                            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-semibold border border-purple-500/20">Analytics</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Visual analysis of crew availability versus flight demand, fatigue hotspots, and fleet delays over 30 days.
                        </p>
                        <button
                            onClick={handleViewUtilizationTrends}
                            className="text-purple-400 hover:text-purple-300 text-xs font-bold hover:underline flex items-center gap-1"
                        >
                            View Analytics &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── MODAL 1: CREW WORKLOAD PREVIEW ───────────────────────────────────────── */}
            {activeModal === 'workload' && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-emerald-500/30 animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <Users className="text-emerald-500" size={18} />
                                <h2 className="text-base font-bold text-white">Crew Workload Summary Preview</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Crew Tracked</p>
                                    <p className="text-xl font-bold text-white mt-1">{utilization.length}</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Avg Utilization</p>
                                    <p className="text-xl font-bold text-emerald-400 mt-1">
                                        {(utilization.reduce((acc, u) => acc + (u.utilizationPercent || parseFloat(u.utilization)), 0) / (utilization.length || 1)).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                    <p className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold">High Load Crew (&gt;80%)</p>
                                    <p className="text-xl font-bold text-rose-400 mt-1">
                                        {utilization.filter(u => (u.utilizationPercent || parseFloat(u.utilization)) > 80).length}
                                    </p>
                                </div>
                            </div>

                            <div className="border border-white/5 rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                                            <th className="px-3 py-2 font-semibold">Crew Member</th>
                                            <th className="px-3 py-2 font-semibold">Type</th>
                                            <th className="px-3 py-2 font-semibold">Total Flights</th>
                                            <th className="px-3 py-2 font-semibold">Total Hours</th>
                                            <th className="px-3 py-2 font-semibold">Weekly Avg</th>
                                            <th className="px-3 py-2 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {utilization.map((c, idx) => {
                                            const pct = c.utilizationPercent || parseFloat(c.utilization);
                                            return (
                                                <tr key={idx} className="hover:bg-white/[0.02]">
                                                    <td className="px-3 py-2 font-bold text-white">{c.crewName}</td>
                                                    <td className="px-3 py-2 text-slate-400 capitalize">{c.crewType}</td>
                                                    <td className="px-3 py-2 font-mono text-slate-200">{c.totalFlights}</td>
                                                    <td className="px-3 py-2 font-mono text-slate-200">{c.totalHours} hrs</td>
                                                    <td className="px-3 py-2 font-mono text-slate-400">{c.weeklyAvgHours || '-'} hrs/wk</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${pct > 80 ? 'bg-rose-500/20 text-rose-300' : pct < 30 ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                            {c.utilization}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-end gap-2">
                            <button onClick={() => setActiveModal(null)} className="glass-button !text-xs">Close</button>
                            <button onClick={handleDownloadWorkload} className="glass-button !py-1.5 !px-3 !text-xs bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1">
                                <Download size={14} /> Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MODAL 2: FLIGHT ASSIGNMENTS REPORT ───────────────────────────────────── */}
            {activeModal === 'assignments' && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-blue-500/30 animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <FileText className="text-blue-500" size={18} />
                                <h2 className="text-base font-bold text-white">Flight Assignments Detailed Report</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                <input
                                    type="text"
                                    placeholder="Search by flight, route, aircraft, pilot..."
                                    value={assignmentSearch}
                                    onChange={(e) => setAssignmentSearch(e.target.value)}
                                    className="bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-full"
                                />
                            </div>
                            <div className="text-xs text-slate-400">
                                Showing <span className="text-white font-bold">{filteredAssignments.length}</span> of {assignmentsData.length} flights
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {modalLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="animate-spin inline text-blue-500 mb-2" size={32} />
                                    <p className="text-xs text-slate-400">Generating report and downloading CSV...</p>
                                </div>
                            ) : (
                                <div className="border border-white/5 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider border-b border-white/5">
                                                <th className="px-3 py-2.5 font-semibold">Flight</th>
                                                <th className="px-3 py-2.5 font-semibold">Route</th>
                                                <th className="px-3 py-2.5 font-semibold">Aircraft</th>
                                                <th className="px-3 py-2.5 font-semibold">Status</th>
                                                <th className="px-3 py-2.5 font-semibold">Pilots Assigned</th>
                                                <th className="px-3 py-2.5 font-semibold">Cabin Crew Assigned</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredAssignments.map((f, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02]">
                                                    <td className="px-3 py-2.5 font-mono font-bold text-blue-400">{f.flightNumber}</td>
                                                    <td className="px-3 py-2.5 font-semibold text-white">{f.origin} ✈️ {f.destination}</td>
                                                    <td className="px-3 py-2.5 text-slate-300">{f.aircraftType}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${f.status === 'on-time' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : f.status === 'delayed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                            {f.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-slate-300 text-[11px]">{f.assignedPilots}</td>
                                                    <td className="px-3 py-2.5 text-slate-400 text-[11px]">{f.assignedCabinCrew}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-end gap-2">
                            <button onClick={() => setActiveModal(null)} className="glass-button !text-xs">Close</button>
                            <button onClick={handleDownloadFlightAssignments} className="glass-button !py-1.5 !px-3 !text-xs bg-blue-600 hover:bg-blue-500 flex items-center gap-1">
                                <Download size={14} /> Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MODAL 3: UTILIZATION TRENDS VISUAL ANALYTICS ─────────────────────────── */}
            {activeModal === 'trends' && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-purple-500/30 animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-purple-500" size={18} />
                                <h2 className="text-base font-bold text-white">Utilization Trends & Fleet Analytics</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {modalLoading || !analyticsData ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="animate-spin inline text-purple-500 mb-2" size={32} />
                                    <p className="text-xs text-slate-400">Loading analytics trends models...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Delay Trends Line Chart */}
                                    <div className="glass-card p-4">
                                        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                                            <Activity className="text-pink-400" size={16} />
                                            Fleet Delays (Rolling 7-Day Window)
                                        </h3>
                                        <div className="h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={analyticsData.historicalDelays} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                                    <Line type="monotone" dataKey="totalFlights" stroke="#3b82f6" strokeWidth={2} name="Total Flights" />
                                                    <Line type="monotone" dataKey="delayedFlights" stroke="#ec4899" strokeWidth={2} name="Delayed Flights" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Crew Fatigue Scatter Plot */}
                                    <div className="glass-card p-4">
                                        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                                            <AlertTriangle className="text-rose-400" size={16} />
                                            Crew Duty Hours vs Fatigue Risk Index
                                        </h3>
                                        <div className="h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                                    <XAxis type="number" dataKey="dutyHours" name="Duty Hours" stroke="#94a3b8" fontSize={10} axisLine={false} />
                                                    <YAxis type="number" dataKey="fatigueScore" name="Fatigue Score" stroke="#94a3b8" fontSize={10} axisLine={false} />
                                                    <ZAxis type="number" range={[40, 180]} />
                                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                                    <Scatter name="Crew Fatigue" data={analyticsData.crewFatigue} fill="#a855f7" />
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-end">
                            <button onClick={() => setActiveModal(null)} className="glass-button !text-xs">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
