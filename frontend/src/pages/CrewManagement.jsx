import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Shield, Briefcase, Trash2, Edit, Loader2, CheckCircle, XCircle, X, Save } from 'lucide-react';

const CREW_TYPES = ['pilot', 'cabin_crew'];
const STATUSES = ['active', 'inactive'];

const EditModal = ({ member, onClose, onSaved }) => {
    const [form, setForm] = useState({
        crewType: member.crewType || '',
        qualification: member.qualification || '',
        maxHoursPerWeek: member.maxHoursPerWeek || 40,
        status: member.status || 'active',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.put(`/crew/${member.id}`, {
                ...form,
                maxHoursPerWeek: parseInt(form.maxHoursPerWeek),
            });
            onSaved();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to update crew member.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md p-8 relative shadow-2xl border border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-1">Edit Crew Member</h2>
                <p className="text-slate-400 text-sm mb-6">{member.user.name} — {member.user.email}</p>

                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Crew Type
                        </label>
                        <select
                            name="crewType"
                            value={form.crewType}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500/50"
                        >
                            {CREW_TYPES.map((t) => (
                                <option key={t} value={t} className="bg-slate-900">
                                    {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Qualification
                        </label>
                        <input
                            type="text"
                            name="qualification"
                            value={form.qualification}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500/50"
                            placeholder="e.g. Boeing 737, A320"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Max Hours / Week
                        </label>
                        <input
                            type="number"
                            name="maxHoursPerWeek"
                            value={form.maxHoursPerWeek}
                            onChange={handleChange}
                            min={1}
                            max={168}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500/50"
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s} className="bg-slate-900">
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 glass-button flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CrewManagement = () => {
    const [crew, setCrew] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState(null);

    const fetchData = async () => {
        setLoading(true);
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
        if (!window.confirm('Remove this crew member? This action cannot be undone.')) return;
        try {
            await api.delete(`/crew/${id}`);
            fetchData();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Error deleting crew member.';
            alert(msg);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {editTarget && (
                <EditModal
                    member={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={() => {
                        setEditTarget(null);
                        fetchData();
                    }}
                />
            )}

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
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <Loader2 className="animate-spin inline text-primary-500" size={32} />
                                    </td>
                                </tr>
                            ) : crew.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-500">
                                        No crew members found.
                                    </td>
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
                                            <span className="text-xs font-semibold capitalize">{member.crewType?.replace('_', ' ')}</span>
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
                                            <button
                                                onClick={() => setEditTarget(member)}
                                                className="p-2 text-slate-400 hover:text-primary-400 bg-white/5 rounded-lg border border-white/5 shadow-sm"
                                                title="Edit crew member"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 bg-white/5 rounded-lg border border-white/5 shadow-sm"
                                                title="Delete crew member"
                                            >
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
