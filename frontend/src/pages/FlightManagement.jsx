import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plane, Plus, Trash2, MapPin, Clock, Loader2, Radio, Users, CheckCircle2, AlertTriangle, XCircle, UploadCloud, FileUp, CheckCircle, X, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';
import socket from '../services/socket';

const STATUS_META = {
    'on-time': { label: 'On Time', cls: 'status-on-time', icon: <CheckCircle2 size={11} /> },
    delayed: { label: 'Delayed', cls: 'status-delayed', icon: <AlertTriangle size={11} /> },
    cancelled: { label: 'Cancelled', cls: 'status-cancelled', icon: <XCircle size={11} /> },
};

const FlightCard = ({ flight, onDelete, onStatusChange, onClick }) => {
    const meta = STATUS_META[flight.status] || STATUS_META['on-time'];
    const durationMs = new Date(flight.arrivalTime) - new Date(flight.departureTime);
    const durationHrs = (durationMs / (1000 * 60 * 60)).toFixed(1);
    const crewCount = flight.schedules?.length || 0;

    return (
        <div className="boarding-pass group cursor-pointer" onClick={onClick}>
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
                    <button onClick={(e) => { e.stopPropagation(); onDelete(flight.id); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
                        <p className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>
                            {format(new Date(flight.departureTime), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
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
                        <p className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>
                            {format(new Date(flight.arrivalTime), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
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
                            <button key={s} onClick={(e) => { e.stopPropagation(); onStatusChange(flight.id, s); }}
                                title={`Mark as ${s}`}
                                className="w-2 h-2 rounded-full transition-all hover:scale-150 cursor-pointer"
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

const FlightDetailModal = ({ flight, onClose }) => {
    const assignedCrew = flight.schedules || [];
    const departureDate = new Date(flight.departureTime);
    const arrivalDate = new Date(flight.arrivalTime);
    const durationHrs = ((arrivalDate - departureDate) / (1000 * 60 * 60)).toFixed(1);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-2xl p-6 relative shadow-2xl border border-white/15 mx-4 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 cursor-pointer">
                    <X size={18} />
                </button>
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                        <Plane size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Flight {flight.flightNumber}</h2>
                        <p className="text-xs text-slate-400">Detailed flight overview and staffing list</p>
                    </div>
                </div>

                {/* Flight Route and Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6">
                    <div className="text-center md:text-left">
                        <p className="hud-label text-[10px] text-slate-500 mb-1">ORIGIN</p>
                        <p className="fids-code text-2xl font-bold text-white">{flight.origin}</p>
                        <p className="text-xs text-slate-400 mt-1">{format(departureDate, 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 md:py-0">
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full mb-1">{durationHrs} hrs</span>
                        <div className="w-full flex items-center gap-1">
                            <div className="h-px flex-1 bg-white/10" />
                            <Plane size={14} className="rotate-90 text-primary-400" />
                            <div className="h-px flex-1 bg-white/10" />
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="hud-label text-[10px] text-slate-500 mb-1">DESTINATION</p>
                        <p className="fids-code text-2xl font-bold text-white">{flight.destination}</p>
                        <p className="text-xs text-slate-400 mt-1">{format(arrivalDate, 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="hud-label text-[9px] text-slate-500">AIRCRAFT</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{flight.aircraftType}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="hud-label text-[9px] text-slate-500">STATUS</p>
                        <p className={`text-xs font-bold uppercase mt-1 tracking-wider ${
                            flight.status === 'on-time' ? 'text-emerald-400' : flight.status === 'delayed' ? 'text-amber-400' : 'text-red-400'
                        }`}>{flight.status}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="hud-label text-[9px] text-slate-500">GATE / TERMINAL</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{flight.gate || 'TBD'} / {flight.terminal || 'T3'}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="hud-label text-[9px] text-slate-500">CREW SIZE</p>
                        <p className="text-sm font-bold text-white mt-0.5">{assignedCrew.length} Assigned</p>
                    </div>
                </div>

                {/* Crew List Section */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Users size={16} className="text-primary-400" />
                        Assigned Crew Members
                    </h3>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {assignedCrew.length === 0 ? (
                            <div className="p-4 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                                No crew members assigned to this flight yet.
                            </div>
                        ) : (
                            assignedCrew.map((s, idx) => {
                                const member = s.crew;
                                if (!member) return null;
                                return (
                                    <div key={s.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center justify-center font-bold text-xs uppercase">
                                                {member.user?.name?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{member.user?.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{member.crewType} &bull; {member.qualification}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                            member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                        }`}>{member.status}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Action Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer">
                        Close Details
                    </button>
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
    const [routeTypeFilter, setRouteTypeFilter] = useState('all');
    const [hubFilter, setHubFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [formData, setFormData] = useState({
        flightNumber: '', origin: '', destination: '',
        departureTime: '', arrivalTime: '', aircraftType: 'Boeing 737', status: 'on-time', gate: '', terminal: ''
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/flights');
            setFlights(res.data);
            
            // Sync selectedFlight structure if the modal is open
            if (selectedFlight) {
                const updated = res.data.find(f => f.id === selectedFlight.id);
                if (updated) {
                    setSelectedFlight(updated);
                } else {
                    setSelectedFlight(null);
                }
            }
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

    useEffect(() => {
        fetchData();
        
        // Listen for websocket automatic updates from the FIDS sync backend
        socket.on('fids-update', fetchData);
        
        return () => {
            socket.off('fids-update', fetchData);
        };
    }, [selectedFlight?.id]);

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

    const DOMESTIC_AIRPORTS = ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'GOI', 'COK'];

    const filtered = flights.filter(f => {
        // 1. Status Filter
        if (filter !== 'all' && f.status !== filter) return false;

        // 2. Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matches = f.flightNumber.toLowerCase().includes(q) ||
                            f.origin.toLowerCase().includes(q) ||
                            f.destination.toLowerCase().includes(q) ||
                            f.aircraftType.toLowerCase().includes(q);
            if (!matches) return false;
        }

        // 3. Route Type Filter (Domestic / International)
        const isDom = DOMESTIC_AIRPORTS.includes(f.origin) && DOMESTIC_AIRPORTS.includes(f.destination);
        if (routeTypeFilter === 'domestic' && !isDom) return false;
        if (routeTypeFilter === 'international' && isDom) return false;

        // 4. Hub Filter (DEL / BOM)
        if (hubFilter === 'del' && f.origin !== 'DEL' && f.destination !== 'DEL') return false;
        if (hubFilter === 'bom' && f.origin !== 'BOM' && f.destination !== 'BOM') return false;

        // 5. Timing Filter (based on Departure UTC hour)
        if (timeFilter !== 'all') {
            const depHour = new Date(f.departureTime).getUTCHours();
            if (timeFilter === 'morning' && (depHour < 5 || depHour >= 12)) return false;
            if (timeFilter === 'afternoon' && (depHour < 12 || depHour >= 17)) return false;
            if (timeFilter === 'evening' && (depHour < 17 || depHour >= 22)) return false;
            if (timeFilter === 'night' && (depHour >= 5 && depHour < 22)) return false;
        }

        return true;
    });

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
            <div className="flex gap-2 flex-wrap">
                {[['all', 'All Flights'], ['on-time', 'On Time'], ['delayed', 'Delayed'], ['cancelled', 'Cancelled']].map(([key, label]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                        style={{
                            background: filter === key ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                            border: filter === key ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            color: filter === key ? 'var(--electric)' : '#64748b'
                        }}>
                        {label}
                        <span className="px-1.5 py-0.5 rounded text-xs animate-pulse-slow" style={{ background: 'rgba(255,255,255,0.06)' }}>{counts[key]}</span>
                    </button>
                ))}
            </div>

            {/* Advanced Filters Toolbar */}
            <div className="glass-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full lg:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search flight number, origin, dest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="avio-input pl-9"
                    />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto flex-1 max-w-2xl">
                    <div>
                        <select 
                            className="avio-select"
                            value={routeTypeFilter}
                            onChange={(e) => setRouteTypeFilter(e.target.value)}
                        >
                            <option value="all">✈ All Flight Types</option>
                            <option value="domestic">🇮🇳 Domestic Only</option>
                            <option value="international">🌐 International Only</option>
                        </select>
                    </div>
                    <div>
                        <select 
                            className="avio-select"
                            value={hubFilter}
                            onChange={(e) => setHubFilter(e.target.value)}
                        >
                            <option value="all">🏢 All Hub Connections</option>
                            <option value="del">🇮🇳 Delhi Hub (DEL)</option>
                            <option value="bom">🇮🇳 Mumbai Hub (BOM)</option>
                        </select>
                    </div>
                    <div>
                        <select 
                            className="avio-select"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                        >
                            <option value="all">⏱ All Departure Times</option>
                            <option value="morning">🌅 Morning (05:00 - 12:00)</option>
                            <option value="afternoon">☀️ Afternoon (12:00 - 17:00)</option>
                            <option value="evening">🌇 Evening (17:00 - 22:00)</option>
                            <option value="night">🌙 Night (22:00 - 05:00)</option>
                        </select>
                    </div>
                </div>
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
                    <FlightCard
                        key={flight.id}
                        flight={flight}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onClick={() => setSelectedFlight(flight)}
                    />
                ))}
            </div>

            {selectedFlight && (
                <FlightDetailModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
            )}
        </div>
    );
};

export default FlightManagement;
