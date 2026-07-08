import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Download, TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';

const ReportsPage = () => {
    const [utilization, setUtilization] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleDownload = async () => {
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
            alert('Download failed');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Reports</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Operational data and crew utilization analytics</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="glass-button !py-1.5 !px-3 !text-xs flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 shadow-md"
                >
                    <Download size={14} />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Utilization Table (takes 3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-primary-500" size={16} />
                                Crew Utilization Table
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider border-b border-white/5">
                                        <th className="px-4 py-2.5 font-semibold">Crew Member</th>
                                        <th className="px-4 py-2.5 font-semibold">Type</th>
                                        <th className="px-4 py-2.5 font-semibold">Total Flights</th>
                                        <th className="px-4 py-2.5 font-semibold">Total Hours</th>
                                        <th className="px-4 py-2.5 font-semibold font-bold">Utilization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-16 text-center">
                                                <Loader2 className="animate-spin inline text-primary-500" size={24} />
                                            </td>
                                        </tr>
                                    ) : utilization.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-16 text-center text-slate-500">
                                                No utilization data available.
                                            </td>
                                        </tr>
                                    ) : utilization.map((row, i) => {
                                        const pct = row.utilizationPercent ?? parseFloat(row.utilization);
                                        let barColor = "bg-emerald-500";
                                        let badgeColor = "text-emerald-400 bg-emerald-500/10";
                                        if (pct > 80) {
                                            barColor = "bg-rose-500";
                                            badgeColor = "text-rose-400 bg-rose-500/10";
                                        } else if (pct < 30) {
                                            barColor = "bg-sky-400";
                                            badgeColor = "text-sky-400 bg-sky-500/10";
                                        }

                                        return (
                                            <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="px-4 py-3 font-bold text-white uppercase tracking-tight">{row.crewName}</td>
                                                <td className="px-4 py-3 text-slate-400 capitalize">{row.crewType}</td>
                                                <td className="px-4 py-3 text-slate-200">{row.totalFlights}</td>
                                                <td className="px-4 py-3 text-slate-200 font-mono">{row.totalHours} hrs</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: row.utilization }} />
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

                {/* Right Column: Available Reports (takes 1 col) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-card p-4 border-l-2 border-emerald-500">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Users className="text-emerald-500" size={18} />
                            <h3 className="font-bold text-xs text-white">Crew Workload</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Detailed breakdown of flight hours per crew member, including overtime and rest compliance.
                        </p>
                        <button onClick={handleDownload} className="text-primary-400 hover:text-primary-300 text-xs font-bold hover:underline flex items-center gap-1">
                            Generate Report &rarr;
                        </button>
                    </div>

                    <div className="glass-card p-4 border-l-2 border-blue-500">
                        <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="text-blue-500" size={18} />
                            <h3 className="font-bold text-xs text-white">Flight Assignments</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Comprehensive list of all flight routes and assigned crew, categorized by aircraft type.
                        </p>
                        <button className="text-primary-400 hover:text-primary-300 text-xs font-bold hover:underline flex items-center gap-1">
                            Generate Report &rarr;
                        </button>
                    </div>

                    <div className="glass-card p-4 border-l-2 border-purple-500">
                        <div className="flex items-center gap-2 mb-1.5">
                            <TrendingUp className="text-purple-500" size={18} />
                            <h3 className="font-bold text-xs text-white">Utilization Trends</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Visual analysis of crew availability versus flight demand over the last 30 days.
                        </p>
                        <button className="text-primary-400 hover:text-primary-300 text-xs font-bold hover:underline flex items-center gap-1">
                            View Analytics &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
