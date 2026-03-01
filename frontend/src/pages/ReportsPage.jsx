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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Reports</h1>
                    <p className="text-slate-400 mt-1">Operational data and crew utilization analytics</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="glass-button flex items-center gap-2 bg-primary-600 hover:bg-primary-500 shadow-xl shadow-primary-500/20"
                >
                    <Download size={18} />
                    Download Workload CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="text-emerald-500" size={24} />
                        <h3 className="font-bold text-white">Crew Workload</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">Detailed breakdown of flight hours per crew member, including overtime and rest compliance.</p>
                    <button onClick={handleDownload} className="text-primary-500 text-sm font-bold hover:underline">Generate Report</button>
                </div>
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-blue-500" size={24} />
                        <h3 className="font-bold text-white">Flight Assignments</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">Comprehensive list of all flight routes and assigned crew, categorized by aircraft type.</p>
                    <button className="text-primary-500 text-sm font-bold hover:underline">Generate Report</button>
                </div>
                <div className="glass-card p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="text-purple-500" size={24} />
                        <h3 className="font-bold text-white">Utilization Trends</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">Visual analysis of crew availability versus flight demand over the last 30 days.</p>
                    <button className="text-primary-500 text-sm font-bold hover:underline">View Analytics</button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-primary-500" size={20} />
                        Utilization Table
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Crew Member</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Total Flights</th>
                                <th className="px-6 py-4 font-semibold">Total Hours</th>
                                <th className="px-6 py-4 font-semibold font-bold">Utilization %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center"><Loader2 className="animate-spin inline text-primary-500" size={32} /></td>
                                </tr>
                            ) : utilization.map((row, i) => (
                                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white uppercase tracking-tight">{row.crewName}</td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-400 capitalize">{row.crewType}</td>
                                    <td className="px-6 py-4 text-sm text-white">{row.totalFlights}</td>
                                    <td className="px-6 py-4 text-sm text-white font-mono">{row.totalHours} hrs</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500" style={{ width: row.utilization }} />
                                            </div>
                                            <span className="text-sm font-bold text-white">{row.utilization}</span>
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

export default ReportsPage;
