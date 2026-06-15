import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Loader2, Sunrise, MoonStar } from 'lucide-react';
import { format } from 'date-fns';

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AvailabilityManagement = () => {
    const { user } = useAuth();
    const [selectedDay, setSelectedDay] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [crewId, setCrewId] = useState(null);

    const fetchAvailability = async () => {
        try {
            const res = await api.get('/crew/me');
            setCrewId(res.data.id);
            setSelectedDay(res.data.inactiveDayOfWeek || '');
        } catch (err) {
            console.error('Failed to fetch availability', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, [user.id]);

    const handleUpdateStatus = async () => {
        if (!crewId) return;
        setSubmitting(true);
        try {
            await api.post(`/crew/${crewId}/availability`, {
                inactiveDayOfWeek: selectedDay
            });
            fetchAvailability();
        } catch (err) {
            alert('Failed to update availability');
        } finally {
            setSubmitting(false);
        }
    };

    const currentDay = format(new Date(), 'EEEE');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Weekly Availability</h1>
                <p className="text-slate-400 mt-1">Pick one day of the week you want to be inactive</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <CalendarIcon className="text-primary-500" size={20} />
                        Choose Inactive Day
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {WEEK_DAYS.map((day) => {
                            const isSelected = selectedDay === day;
                            const isToday = currentDay === day;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setSelectedDay(day)}
                                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${isSelected ? 'bg-red-500/15 border-red-500/40 ring-1 ring-red-500/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-white">{day}</p>
                                            <p className="text-xs text-slate-500 mt-1">Inactive for every {day}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-400'}`}>
                                            {day === 'Sunday' || day === 'Saturday' ? <MoonStar size={18} /> : <Sunrise size={18} />}
                                        </div>
                                    </div>
                                    {isToday && (
                                        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            Today
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">Selected inactive day</p>
                            <p className="text-base font-bold text-white mt-1">{selectedDay || 'No day selected yet'}</p>
                        </div>
                        <button
                            onClick={handleUpdateStatus}
                            disabled={!selectedDay || submitting}
                            className="glass-button gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Save Day
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 bg-primary-600/5 border-primary-500/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="text-primary-500" size={20} />
                            Scheduling Impact
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The scheduler will avoid assigning you on your selected inactive weekday every week.
                            If today matches your inactive day, the admin crew view will show you as inactive.
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
                                Only one inactive weekday can be selected at a time.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                                You can change the inactive day whenever your rota changes.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManagement;
