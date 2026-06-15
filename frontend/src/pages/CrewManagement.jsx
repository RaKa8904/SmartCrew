import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Shield, Briefcase, Trash2, Edit, Loader2, CheckCircle, XCircle, X, Save, UploadCloud, FileUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const CREW_TYPES = ['pilot', 'cabin_crew'];
const STATUSES = ['active', 'inactive'];
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EditModal = ({ member, onClose, onSaved }) => {
    const [form, setForm] = useState({
        crewType: member.crewType || '',
        qualification: member.qualification || '',
        maxHoursPerWeek: member.maxHoursPerWeek || 40,
        status: member.status || 'active',
        inactiveDayOfWeek: member.inactiveDayOfWeek || '',
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

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Inactive Day
                        </label>
                        <select
                            name="inactiveDayOfWeek"
                            value={form.inactiveDayOfWeek}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500/50"
                        >
                            <option value="" className="bg-slate-900">No inactive day</option>
                            {WEEK_DAYS.map((day) => (
                                <option key={day} value={day} className="bg-slate-900">
                                    {day}
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

const CSVUploadModal = ({ onClose, onSaved }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('File size must not exceed 2MB.');
                return;
            }
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Only .csv files are allowed.');
                return;
            }
            setError('');
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > 2 * 1024 * 1024) {
                setError('File size must not exceed 2MB.');
                return;
            }
            if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
                setError('Only .csv files are allowed.');
                return;
            }
            setError('');
            setFile(droppedFile);
            setResult(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        setResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/admin/upload-crew-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
            if (res.data.inserted > 0) {
                onSaved(res.data.inserted, res.data.failed);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to upload CSV. Please ensure you have Admin privileges.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-lg p-8 relative shadow-2xl border border-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-white mb-1">Bulk Crew Upload (CSV)</h2>
                <p className="text-slate-400 text-sm mb-6">Upload a .csv file to add multiple crew members at once.</p>

                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {!result && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors bg-white/5 relative"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <FileUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Drag & drop your CSV here</p>
                                <p className="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Max 2MB. Columns: name, email, crew_type, qualification, max_hours_per_week, status</p>
                        </div>
                    </div>
                )}

                {file && !result && (
                    <div className="mt-4 flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                        <span className="text-sm text-slate-300 font-medium truncate pr-4">{file.name}</span>
                        <span className="text-xs text-slate-500 shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                )}

                {result && (
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 text-sm">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2 font-bold text-base">
                            <CheckCircle size={18} /> Upload Complete
                        </div>
                        <ul className="space-y-1 text-slate-300 mb-4">
                            <li>Total Rows: <span className="font-bold text-white">{result.total_rows}</span></li>
                            <li>Successfully Added: <span className="font-bold text-emerald-400">{result.inserted}</span></li>
                            <li>Failed: <span className="font-bold text-red-400">{result.failed}</span></li>
                        </ul>
                        {result.detailed_errors && result.detailed_errors.length > 0 && (
                            <div className="mt-4 text-xs bg-red-500/10 p-4 rounded-lg border border-red-500/20 max-h-40 overflow-y-auto custom-scrollbar">
                                <p className="font-bold text-red-400 mb-2 uppercase tracking-wider text-[10px]">Error Details:</p>
                                <ul className="space-y-1 text-red-300">
                                    {result.detailed_errors.map((e, idx) => (
                                        <li key={idx}>Row {e.row}: {e.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors">
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && (
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="flex-1 glass-button flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                            {uploading ? 'Uploading…' : 'Upload CSV'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const CrewManagement = () => {
    const [crew, setCrew] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const todayDay = format(new Date(), 'EEEE');

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
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {toastMessage && (
                <div className="absolute top-0 right-0 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                    <CheckCircle size={16} />
                    <span className="text-sm font-semibold">{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-400/50 hover:text-emerald-400">
                        <X size={14} />
                    </button>
                </div>
            )}

            {showUploadModal && (
                <CSVUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onSaved={(inserted, failed) => {
                        setToastMessage(`${inserted} Crew Member(s) Added Successfully.`);
                        if (failed === 0) setShowUploadModal(false); // only close if no errors
                        fetchData();
                        setTimeout(() => setToastMessage(null), 5000);
                    }}
                />
            )}

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
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="glass-button flex items-center gap-2 px-4 py-2 text-sm"
                    >
                        <UploadCloud size={16} />
                        Upload Crew CSV
                    </button>
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
                                <th className="px-6 py-4 font-semibold">Inactive Day</th>
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
                                <tr key={member.id} className="hover:bg-white/2 transition-colors group">
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
                                        {member.inactiveDayOfWeek ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full w-fit bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <XCircle size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{member.inactiveDayOfWeek}</span>
                                                </div>
                                                {member.inactiveDayOfWeek === todayDay && (
                                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full w-fit bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <CheckCircle size={12} />
                                                        <span className="text-[10px] font-bold uppercase tracking-tight">Inactive today</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-500">Not set</span>
                                        )}
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
