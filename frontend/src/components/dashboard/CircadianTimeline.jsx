import React from 'react';
import { Moon, Sun, Clock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const CircadianTimeline = ({ nextFlight, fatigueScore = 15 }) => {
    if (!nextFlight) {
        return (
            <div className="glass-card p-6 border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <Moon size={18} className="text-indigo-400" />
                    <h3 className="font-bold text-white text-base">Circadian Recovery Status</h3>
                </div>
                <p className="text-xs text-slate-400">No upcoming duty leg assigned. Rest state is optimal.</p>
            </div>
        );
    }

    const depTime = new Date(nextFlight.departureTime);
    const depHour = depTime.getHours();
    const isNightShift = depHour >= 22 || depHour <= 5;

    // Circadian window calculation
    let statusText = 'Optimal Circadian Recovery';
    let statusColor = 'text-emerald-400';
    let statusBg = 'bg-emerald-500/10 border-emerald-500/20';

    if (fatigueScore > 65 || isNightShift) {
        statusText = 'Window of Circadian Low (WOCL) Shift';
        statusColor = 'text-amber-400';
        statusBg = 'bg-amber-500/10 border-amber-500/20';
    }

    return (
        <div className="glass-card p-6 border-slate-800">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Moon size={18} className="text-indigo-400" />
                        <span className="hud-label text-xs">BIOMATHEMATICAL SLEEP & RECOVERY</span>
                    </div>
                    <h3 className="font-bold text-white text-lg">Circadian Rhythm & Recovery Timeline</h3>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusBg} ${statusColor}`}>
                    {statusText}
                </span>
            </div>

            {/* Visual Timeline Bar */}
            <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Rest Interval (Sleep Window)</span>
                    <span>Flight Departure ({depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                </div>

                <div className="relative w-full h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden flex">
                    <div className="w-1/3 bg-emerald-500/30 border-r border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                        Deep Sleep (8h)
                    </div>
                    <div className="w-1/3 bg-indigo-500/30 border-r border-indigo-500/50 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                        Circadian Buffer (6h)
                    </div>
                    <div className={`w-1/3 ${isNightShift ? 'bg-amber-500/30 text-amber-300' : 'bg-sky-500/30 text-sky-300'} flex items-center justify-center text-[10px] font-bold`}>
                        {isNightShift ? 'WOCL Shift Leg' : 'Duty Ready'}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                        <p className="hud-label text-[10px] mb-0.5">RECOVERY WINDOW</p>
                        <p className="font-bold text-white">14.5 Hours</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                        <p className="hud-label text-[10px] mb-0.5">CIRCADIAN DELETION</p>
                        <p className="font-bold text-emerald-400">{fatigueScore < 40 ? 'Minimal (-8%)' : 'Moderate (+22%)'}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                        <p className="hud-label text-[10px] mb-0.5">RECOMMENDED BUFFER</p>
                        <p className="font-bold text-indigo-400">+4.0h Rest</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircadianTimeline;
