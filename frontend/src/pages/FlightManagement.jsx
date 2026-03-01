import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plane, Plus, Trash2, MapPin, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const FlightManagement = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        aircraftType: 'Boeing 737'
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/flights');
            setFlights(res.data);
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/flights', formData);
            setShowForm(false);
            setFormData({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', aircraftType: 'Boeing 737' });
            fetchData();
        } catch (err) {
            alert('Error creating flight');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this flight?')) return;
        try {
            await api.delete(`/flights/${id}`);
            fetchData();
        } catch (err) {
            alert('Error deleting flight');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Flight Management</h1>
                    <p className="text-slate-400 mt-1">Manage fleet schedules and routes</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="glass-button flex items-center gap-2"
                >
                    {showForm ? 'Cancel' : <><Plus size={18} /> Add New Flight</>}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-8 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Flight Number</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                placeholder="EK202"
                                value={formData.flightNumber}
                                onChange={e => setFormData({ ...formData, flightNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Origin (ICAO/IATA)</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                placeholder="DXB"
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Destination</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                placeholder="LHR"
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Departure</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                value={formData.departureTime}
                                onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Arrival</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                value={formData.arrivalTime}
                                onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Aircraft Type</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                value={formData.aircraftType}
                                onChange={e => setFormData({ ...formData, aircraftType: e.target.value })}
                            >
                                <option value="Boeing 737">Boeing 737</option>
                                <option value="Airbus A320">Airbus A320</option>
                                <option value="Boeing 777">Boeing 777</option>
                                <option value="Airbus A380">Airbus A380</option>
                            </select>
                        </div>
                        <div className="lg:col-span-3 flex justify-end">
                            <button type="submit" className="glass-button bg-primary-600 px-8">Save Flight</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin inline text-primary-500" size={32} /></div>
                ) : flights.map(flight => (
                    <div key={flight.id} className="glass-card p-6 group hover:border-primary-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                <Plane size={24} />
                            </div>
                            <button onClick={() => handleDelete(flight.id)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 uppercase">{flight.flightNumber}</h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium tracking-widest">{flight.aircraftType}</p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-300">
                                <MapPin size={16} className="text-slate-500" />
                                <span className="text-sm font-bold">{flight.origin}</span>
                                <div className="h-[1px] w-4 bg-slate-700" />
                                <span className="text-sm font-bold">{flight.destination}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Clock size={16} className="text-slate-500" />
                                <span className="text-xs">{format(new Date(flight.departureTime), 'MMM dd, HH:mm')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlightManagement;
