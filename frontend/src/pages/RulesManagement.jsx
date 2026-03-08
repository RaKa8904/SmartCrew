import React, { useState } from 'react';
import { Settings, Save, AlertCircle, Clock, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { useRules } from '../context/RulesContext';

const ICONS = [Clock, Calendar, Settings, AlertCircle];

const RulesManagement = () => {
    const { rules, loading, error, updateRule } = useRules();

    // Local draft state — mirrors DB values but tracks unsaved edits
    const [drafts, setDrafts] = useState({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');

    const getDraftValue = (rule) =>
        drafts[rule.id] !== undefined ? drafts[rule.id] : rule.value;

    const handleValueChange = (id, val) => {
        setDrafts((prev) => ({ ...prev, [id]: val === '' ? '' : val }));
        setSaved(false);
        setSaveError('');
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setSaved(false);
        setSaveError('');
        try {
            for (const rule of rules) {
                const draft = drafts[rule.id];
                if (draft !== undefined && Number(draft) !== rule.value) {
                    await updateRule(rule.id, Number(draft));
                }
            }
            setDrafts({}); // Clear drafts — DB values take over
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setSaveError(err?.response?.data?.message || 'Failed to save rules. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Rules &amp; Constraints</h1>
                    <p className="text-slate-400 mt-1">Configure intelligent scheduling parameters</p>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="glass-button flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : saved ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                    ) : (
                        <Save size={18} />
                    )}
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save All Changes'}
                </button>
            </div>

            {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    {saveError}
                </div>
            )}

            {error && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rules.map((rule, idx) => {
                    const Icon = ICONS[idx % ICONS.length];
                    const currentVal = getDraftValue(rule);
                    const isDirty = drafts[rule.id] !== undefined && Number(drafts[rule.id]) !== rule.value;

                    return (
                        <div
                            key={rule.id}
                            className={`glass-card p-8 group transition-all ${isDirty ? 'border-primary-500/40' : 'hover:border-primary-500/30'}`}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                    <Icon size={24} />
                                </div>
                                <div className={`flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border transition-colors ${isDirty ? 'border-primary-500/50' : 'border-white/10 focus-within:border-primary-500/40'}`}>
                                    {rule.unit === 'bool' ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleValueChange(rule.id, currentVal === 1 ? 0 : 1)}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${currentVal === 1 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                title={`Toggle ${rule.name}`}
                                            >
                                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${currentVal === 1 ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                            <span className="text-white font-bold text-sm w-8">{currentVal === 1 ? 'ON' : 'OFF'}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="number"
                                                value={currentVal}
                                                onChange={(e) => handleValueChange(rule.id, e.target.value)}
                                                min={0}
                                                className="w-14 bg-transparent text-white font-bold text-right focus:outline-none"
                                                title={`Edit ${rule.name}`}
                                            />
                                            <span className="text-xs font-bold text-slate-500 uppercase">{rule.unit}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{rule.name}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{rule.description}</p>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${isDirty ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                                    {isDirty ? 'Unsaved Changes' : 'Active Constraint'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    DB value: <span className="text-white font-bold">
                                        {rule.unit === 'bool' ? (rule.value === 1 ? 'ON' : 'OFF') : `${rule.value} ${rule.unit}`}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-card p-8 bg-amber-500/5 border-amber-500/20">
                <div className="flex gap-4">
                    <AlertCircle className="text-amber-500 shrink-0" size={24} />
                    <div>
                        <p className="text-amber-500 font-bold mb-1">Configuration Warning</p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Modifying these rules will trigger a re-validation of all existing schedules.
                            Any violations created by new rules will be flagged in the Conflict Viewer.
                            Click <strong className="text-white">Save All Changes</strong> to persist your edits to the database.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesManagement;
