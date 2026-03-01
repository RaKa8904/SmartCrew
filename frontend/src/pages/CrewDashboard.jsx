import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Plane, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const CrewDashboard = () => {
    const { user } = useAuth();
    const [crewDetails, setCrewDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrewData = async () => {
            try {
                const res = await api.get('/crew/me');
                setCrewDetails(res.data);
            } catch (err) {
                console.error('Failed to fetch crew data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCrewData();
    }, [user.id]);

    if (loading) return <div className="text-white">Loading your schedule...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {user.name}</h1>
                <p className="text-slate-400 mt-1">Your upcoming flight assignments and duty hours</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-primary-500" size={20} />
                        Upcoming Flights
                    </h3>

                    {crewDetails?.schedules?.length > 0 ? (
                        <div className="space-y-4">
                            {crewDetails.schedules.map((schedule) => (
                                <div key={schedule.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary-500/30 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-primary-600/20 text-primary-400 text-xs font-bold rounded-full uppercase tracking-wider">
                                                Flight {schedule.flight.flightNumber}
                                            </span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                <Clock size={12} />
                                                {Math.abs(new Date(schedule.flight.arrivalTime) - new Date(schedule.flight.departureTime)) / (1000 * 60 * 60)} hrs duty
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="text-center md:text-left">
                                                <p className="text-2xl font-bold text-white">{schedule.flight.origin}</p>
                                                <p className="text-sm text-slate-400">{format(new Date(schedule.flight.departureTime), 'HH:mm')}</p>
                                            </div>

                                            <div className="flex-1 flex items-center justify-center px-4">
                                                <div className="h-[2px] flex-1 bg-slate-800 relative">
                                                    <Plane className="absolute left-1/2 -translate-x-1/2 -top-2.5 text-primary-500 rotate-90" size={18} />
                                                </div>
                                            </div>

                                            <div className="text-center md:text-right">
                                                <p className="text-2xl font-bold text-white">{schedule.flight.destination}</p>
                                                <p className="text-sm text-slate-400">{format(new Date(schedule.flight.arrivalTime), 'HH:mm')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:border-l border-white/5 md:pl-6 flex flex-col justify-center">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Date</p>
                                        <p className="text-white font-semibold">{format(new Date(schedule.flight.departureTime), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <p className="text-slate-500 italic">No flights scheduled at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-8">
                    <div className="glass-card p-8 bg-primary-600/5 border-primary-500/20">
                        <h3 className="text-lg font-bold text-white mb-6">Duty Summary</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Weekly Hours</span>
                                    <span className="text-white font-bold">18 / {crewDetails?.maxHoursPerWeek || 40}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500" style={{ width: '45%' }} />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-white">Full Compliance</p>
                                    <p className="text-xs text-slate-500">Rest requirements met</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8">
                        <h3 className="text-lg font-bold text-white mb-6">Quick Status</h3>
                        <button className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl font-semibold transition-all">
                            Mark as Available
                        </button>
                        <p className="text-xs text-slate-500 text-center mt-4 italic">
                            Updating your availability helps the system auto-assign flights.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrewDashboard;
