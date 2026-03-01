import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, User, Shield, Briefcase, Trash2, Edit, Loader2, CheckCircle, XCircle } from 'lucide-react';

const CrewManagement = () => {
    const [crew, setCrew] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/crew');
            setCrew(res.data);
        } catch (err) {
            console.error('Failed to fetch crew', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this crew member?')) return;
        try {
            await api.delete(`/crew/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting crew member');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Crew Management</h1>
                    <p className="text-slate-400 mt-1">Manage pilots and cabin crew profiles</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card flex items-center gap-2 px-4 py-2 border-primary-500/20">
                        <Users className="text-primary-500" size={18} />
                        <span className="text-sm font-bold text-white">{crew.length} Active Crew</span>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Crew Name</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Qualification</th>
                                <th className="px-6 py-4 font-semibold">Weekly Max</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center"><Loader2 className="animate-spin inline text-primary-500" size={32} /></td>
                                </tr>
                            ) : crew.map((member) => (
                                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-primary-500 border border-white/5 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                {member.user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{member.user.name}</p>
                                                <p className="text-xs text-slate-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            {member.crewType === 'pilot' ? <Shield size={14} className="text-blue-400" /> : <Briefcase size={14} className="text-purple-400" />}
                                            <span className="text-xs font-semibold capitalize">{member.crewType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-400 tracking-wider">
                                        {member.qualification}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white font-bold">
                                        {member.maxHoursPerWeek} hrs
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {member.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{member.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2 text-slate-400 hover:text-primary-400 bg-white/5 rounded-lg border border-white/5 shadow-sm">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-400 bg-white/5 rounded-lg border border-white/5 shadow-sm">
                                                <Trash2 size={16} />
                                            </button>
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

export default CrewManagement;
