import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plane, Plus, Trash2, MapPin, Clock, Loader2, Radio, Users, CheckCircle2, AlertTriangle, XCircle, UploadCloud, FileUp, CheckCircle, X, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_META = {
    'on-time': { label: 'On Time', cls: 'status-on-time', icon: <CheckCircle2 size={11} /> },
    delayed: { label: 'Delayed', cls: 'status-delayed', icon: <AlertTriangle size={11} /> },
    cancelled: { label: 'Cancelled', cls: 'status-cancelled', icon: <XCircle size={11} /> },
};

const FlightCard = ({ flight, onDelete, onStatusChange }) => {
    const meta = STATUS_META[flight.status] || STATUS_META['on-time'];
    const durationMs = new Date(flight.arrivalTime) - new Date(flight.departureTime);
    const durationHrs = (durationMs / (1000 * 60 * 60)).toFixed(1);
    const crewCount = flight.schedules?.length || 0;

    return (
        <div className="boarding-pass group">
            {/* Top strip */}
            <div className="px-5 pt-5 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`status-badge ${meta.cls}`}>
                            {meta.icon} {meta.label}
                        </span>
                        {flight.gate && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(14,165,233,0.08)', color: '#64748b' }}>
                                Gate {flight.gate}
                            </span>
                        )}
                    </div>
                    <button onClick={() => onDelete(flight.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                        <Trash2 size={15} />
                    </button>
                </div>

                {/* Route display */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="fids-code text-3xl font-bold text-white">{flight.origin}</p>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                            {format(new Date(flight.departureTime), 'HH:mm')}
                        </p>
                    </div>

                    <div className="flex-1 mx-4 flex flex-col items-center gap-1">
                        <div className="w-full flex items-center gap-1">
                            <div className="h-px flex-1" style={{ background: 'rgba(14,165,233,0.2)' }} />
                            <Plane size={16} className="rotate-90 flex-shrink-0" style={{ color: '#0ea5e9' }} />
                            <div className="h-px flex-1" style={{ background: 'rgba(14,165,233,0.2)' }} />
                        </div>
                        <p className="text-xs" style={{ color: '#475569' }}>{durationHrs}h</p>
                    </div>

                    <div className="text-right">
                        <p className="fids-code text-3xl font-bold text-white">{flight.destination}</p>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                            {format(new Date(flight.arrivalTime), 'HH:mm')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashed separator */}
            <div className="border-t border-dashed mx-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            {/* Bottom strip */}
            <div className="px-5 py-3 flex items-center justify-between">
                <div>
                    <p className="fids-code text-base font-bold" style={{ color: '#0ea5e9' }}>{flight.flightNumber}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{flight.aircraftType}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Users size={13} style={{ color: '#64748b' }} />
                        <span className="text-xs font-semibold" style={{ color: crewCount > 0 ? '#10b981' : '#64748b' }}>
                            {crewCount} crew
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {Object.keys(STATUS_META).map(s => (
                            <button key={s} onClick={() => onStatusChange(flight.id, s)}
                                title={`Mark as ${s}`}
                                className="w-2 h-2 rounded-full transition-all hover:scale-150"
                                style={{
                                    background: flight.status === s
                                        ? s === 'on-time' ? '#10b981' : s === 'delayed' ? '#f59e0b' : '#ef4444'
                                        : 'rgba(255,255,255,0.1)'
                                }} />
                        ))}
                    </div>
                </div>
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

            const res = await api.post('/admin/upload-flight-csv', formData, {
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
                <h2 className="text-xl font-bold text-white mb-1">Bulk Flight Upload (CSV)</h2>
                <p className="text-slate-400 text-sm mb-6">Upload a .csv file to add multiple flights at once.</p>

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
                            <p className="text-[10px] text-slate-500 mt-2">Max 2MB. Columns: flightNumber, origin, destination, departureTime, arrivalTime, aircraftType, status, gate, terminal</p>
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

const FlightManagement = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        flightNumber: '', origin: '', destination: '',
        departureTime: '', arrivalTime: '', aircraftType: 'Boeing 737', status: 'on-time', gate: '', terminal: ''
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/flights');
            setFlights(res.data);
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally { setLoading(false); }
    };

    const handleSync = async () => {
        if (!window.confirm('⚠️ WARNING: This will WIPE ALL current flights and schedules to prevent data corruption. Proceed with Live Data Sync?')) return;
        setSyncing(true);
        try {
            const res = await api.post('/flights/sync');
            setToastMessage(`✅ Success: ${res.data.count} live flights ingested!`);
            fetchData();
        } catch (err) {
            alert('Live Sync failed. Refer to server logs.');
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/flights', formData);
            setShowForm(false);
            setFormData({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', aircraftType: 'Boeing 737', status: 'on-time', gate: '', terminal: '' });
            fetchData();
        } catch (err) { alert('Error creating flight'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this flight?')) return;
        try { await api.delete(`/flights/${id}`); fetchData(); }
        catch (err) { alert('Error deleting flight'); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/flights/${id}`, { status });
            setFlights(prev => prev.map(f => f.id === id ? { ...f, status } : f));
        } catch (err) { console.error('Status update failed', err); }
    };

    const filtered = filter === 'all' ? flights : flights.filter(f => f.status === filter);

    const counts = {
        all: flights.length,
        'on-time': flights.filter(f => f.status === 'on-time').length,
        delayed: flights.filter(f => f.status === 'delayed').length,
        cancelled: flights.filter(f => f.status === 'cancelled').length,
    };

    return (
        <div className="space-y-6 page-enter relative">
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
                        setToastMessage(`${inserted} Flight(s) Added Successfully.`);
                        if (failed === 0) setShowUploadModal(false); // only close if no errors
                        fetchData();
                        setTimeout(() => setToastMessage(null), 5000);
                    }}
                />
            )}

            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Radio size={14} style={{ color: '#0ea5e9' }} />
                        <span className="hud-label">FLIGHT OPERATIONS</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Flight Management</h1>
                    <p className="mt-1" style={{ color: '#64748b' }}>Manage fleet routes and operational status</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="glass-button flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}
                    >
                        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                        Live FIDS Sync
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="glass-button flex items-center gap-2 px-4 py-2 text-sm"
                    >
                        <UploadCloud size={16} />
                        Upload Flight CSV
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className={showForm ? 'glass-button-danger glass-button' : 'glass-button'}>
                        {showForm ? '✕ Cancel' : <><Plus size={16} /> Add Flight</>}
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2">
                {[['all', 'All Flights'], ['on-time', 'On Time'], ['delayed', 'Delayed'], ['cancelled', 'Cancelled']].map(([key, label]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: filter === key ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                            border: filter === key ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            color: filter === key ? '#0ea5e9' : '#64748b'
                        }}>
                        {label}
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>{counts[key]}</span>
                    </button>
                ))}
            </div>

            {/* Add Flight Form */}
            {showForm && (
                <div className="glass-card p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={16} style={{ color: '#0ea5e9' }} /> New Flight
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Flight No.', key: 'flightNumber', placeholder: 'EK202' },
                            { label: 'Origin (IATA)', key: 'origin', placeholder: 'DXB' },
                            { label: 'Destination', key: 'destination', placeholder: 'LHR' },
                            { label: 'Gate', key: 'gate', placeholder: 'A14' },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="hud-label text-xs">{label}</label>
                                <input type="text" className="avio-input" placeholder={placeholder} value={formData[key]}
                                    onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <label className="hud-label text-xs">Departure</label>
                            <input type="datetime-local" className="avio-input" value={formData.departureTime}
                                onChange={e => setFormData({ ...formData, departureTime: e.target.value })} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="hud-label text-xs">Arrival</label>
                            <input type="datetime-local" className="avio-input" value={formData.arrivalTime}
                                onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="hud-label text-xs">Aircraft</label>
                            <select className="avio-select" value={formData.aircraftType}
                                onChange={e => setFormData({ ...formData, aircraftType: e.target.value })}>
                                {['Boeing 737', 'Boeing 777', 'Boeing 787', 'Airbus A320', 'Airbus A330', 'Airbus A350', 'Airbus A380'].map(a => (
                                    <option key={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="hud-label text-xs">Status</label>
                            <select className="avio-select" value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="on-time">On Time</option>
                                <option value="delayed">Delayed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="col-span-full flex justify-end">
                            <button type="submit" className="glass-button">Save Flight</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Flight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)
                ) : filtered.length === 0 ? (
                    <div className="col-span-full glass-card p-16 text-center">
                        <Plane size={40} className="mx-auto mb-4 opacity-20" />
                        <p style={{ color: '#475569' }}>No flights found for this filter.</p>
                    </div>
                ) : filtered.map(flight => (
                    <FlightCard key={flight.id} flight={flight} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                ))}
            </div>
        </div>
    );
};

export default FlightManagement;
