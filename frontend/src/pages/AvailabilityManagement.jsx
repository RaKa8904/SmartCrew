import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

const AvailabilityManagement = () => {
    const { user } = useAuth();
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [crewId, setCrewId] = useState(null);

    const fetchAvailability = async () => {
        try {
            const allCrew = await api.get('/crew');
            const me = allCrew.data.find(c => c.userId === user.id);
            if (me) {
                setCrewId(me.id);
                const res = await api.get(`/crew/${me.id}`);
                setAvailability(res.data.availability || []);
            }
        } catch (err) {
            console.error('Failed to fetch availability', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, [user.id]);

    const handleUpdateStatus = async (date, status) => {
        if (!crewId) return;
        setSubmitting(true);
        try {
            await api.post(`/crew/${crewId}/availability`, {
                availableDate: date,
                status: status
            });
            fetchAvailability();
        } catch (err) {
            alert('Failed to update availability');
        } finally {
            setSubmitting(false);
        }
    };

    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Availability Management</h1>
                <p className="text-slate-400 mt-1">Mark your preferred flight dates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <CalendarIcon className="text-primary-500" size={20} />
                        Next 7 Days
                    </h3>
                    <div className="space-y-4">
                        {next7Days.map((date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const currentStatus = availability.find(a => format(new Date(a.availableDate), 'yyyy-MM-dd') === dateStr);

                            return (
                                <div key={dateStr} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                    <div>
                                        <p className="text-sm font-bold text-white">{format(date, 'EEEE, MMM dd')}</p>
                                        <p className="text-xs text-slate-500">
                                            {currentStatus ? `Status: ${currentStatus.status}` : 'Not set'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(date, 'available')}
                                            disabled={submitting}
                                            className={`p-2 rounded-lg border transition-all ${currentStatus?.status === 'available' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-500 hover:text-emerald-500'}`}
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(date, 'off')}
                                            disabled={submitting}
                                            className={`p-2 rounded-lg border transition-all ${currentStatus?.status === 'off' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-slate-500 hover:text-red-400'}`}
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 bg-primary-600/5 border-primary-500/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="text-primary-500" size={20} />
                            Scheduling Impact
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Updating your availability helps the AI scheduler prioritize your assignments and ensures you are not scheduled during your time off.
                            Schedules are finalized 48 hours in advance.
                        </p>
                    </div>

                    <div className="glass-card p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <AlertCircle className="text-amber-500" size={20} />
                            Important Notes
                        </h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                                Emergency standby is automatically assigned if not marked 'Off'.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                                Minimum 10 hours rest required between consecutive duty periods.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManagement;
