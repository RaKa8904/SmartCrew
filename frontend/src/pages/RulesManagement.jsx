import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings, Save, AlertCircle, Clock, Calendar } from 'lucide-react';

const RulesManagement = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // For now, if no rules in DB, we'll show defaults or use a dedicated endpoint
            const res = await api.get('/flights'); // Just to check connectivity
            // Mocking rules as I haven't implemented a dedicated CRUD for them yet
            setRules([
                { id: 1, name: 'Max Daily Duty Hours', value: 12, unit: 'hrs', description: 'Maximum consecutive hours a crew member can work in 24h.' },
                { id: 2, name: 'Min Rest Period', value: 10, unit: 'hrs', description: 'Minimum rest time required between duty periods.' },
                { id: 3, name: 'Max Weekly Duty Hours', value: 40, unit: 'hrs', description: 'Maximum total duty hours allowed per week.' },
                { id: 4, name: 'Min Crew Per Flight', value: 3, unit: 'pers', description: 'Minimum number of crew (pax + pilots) for standard flights.' },
            ]);
        } catch (err) {
            console.error('Failed to fetch rules', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Rules & Constraints</h1>
                    <p className="text-slate-400 mt-1">Configure intelligent scheduling parameters</p>
                </div>
                <button className="glass-button flex items-center gap-2">
                    <Save size={18} />
                    Save All Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rules.map((rule) => (
                    <div key={rule.id} className="glass-card p-8 group hover:border-primary-500/30 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                {rule.id === 1 ? <Clock size={24} /> : rule.id === 2 ? <Calendar size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-white/5">
                                <input
                                    type="number"
                                    defaultValue={rule.value}
                                    className="w-12 bg-transparent text-white font-bold text-right focus:outline-none"
                                />
                                <span className="text-xs font-bold text-slate-500 uppercase">{rule.unit}</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{rule.name}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{rule.description}</p>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase">Active Constraint</span>
                            <button className="text-primary-500 text-xs font-bold hover:underline">Advanced Settings</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card p-8 bg-amber-500/5 border-amber-500/20">
                <div className="flex gap-4">
                    <AlertCircle className="text-amber-500 shrink-0" size={24} />
                    <div>
                        <p className="text-amber-500 font-bold mb-1">Configuration Warning</p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Modifying these rules will trigger a re-validation of all existing schedules.
                            Any violations created by new rules will be flagged in the Conflict Viewer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesManagement;
