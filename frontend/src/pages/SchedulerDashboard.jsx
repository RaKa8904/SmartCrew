import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Play, AlertCircle, RefreshCw, CheckCircle2,
    Users, Plane, Zap, Calendar, UserPlus, FileWarning, Search, X
} from 'lucide-react';
import { format } from 'date-fns';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';

// Draggable Crew Card
const DraggableCrew = ({ crew, isDragged }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `crew-${crew.id}`,
        data: { crew }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragged ? 0 : 1,
    } : {};

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className={`p-3 rounded-xl mb-3 cursor-grab hover:bg-slate-800/50 transition-colors border ${isDragged ? 'border-dashed border-slate-500' : 'border-slate-700/50 bg-slate-900/40'}`}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {crew.user?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{crew.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate uppercase tracking-widest">{crew.crewType} • {crew.qualification}</p>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">Scheduled:</span>
                <span className={`text-xs font-bold ${crew.schedules?.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{crew.schedules?.length || 0} flights</span>
            </div>
        </div>
    );
};

// Droppable Flight Column — uses flight.schedules directly
const DroppableFlight = ({ flight, onUnassign, onRecommend }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `flight-${flight.id}`,
        data: { flight }
    });

    const assignedCrew = flight.schedules || [];

    return (
        <div ref={setNodeRef} className={`glass-card p-3 w-full transition-all ${isOver ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 bg-emerald-900/10' : ''}`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between mb-3">
                <div className="min-w-0">
                    <span className="fids-code text-sm font-bold text-white">{flight.flightNumber}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-sky-400">{flight.origin}</span>
                        <Plane size={10} className="text-slate-500" />
                        <span className="text-xs font-bold text-sky-400">{flight.destination}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} className="text-sky-400" />
                        <span>{format(new Date(flight.departureTime), 'EEE, MMM d, yyyy')}</span>
                    </div>
                </div>
                <div className="text-left md:text-right shrink-0">
                    <p className="text-sm font-bold text-white">{format(new Date(flight.departureTime), 'HH:mm')} - {format(new Date(flight.arrivalTime), 'HH:mm')}</p>
                    <p className="text-xs text-slate-400">{flight.aircraftType}</p>
                </div>
            </div>

            <div className="space-y-2 min-h-16 p-2 rounded-xl bg-slate-950/30 border border-dashed border-slate-800">
                {assignedCrew.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 pt-4 pb-2">
                        <UserPlus size={16} className="mb-1 opacity-50" />
                        <span className="text-xs font-medium">Drop Crew Here</span>
                    </div>
                ) : (
                    assignedCrew.map((schedule, i) => {
                        const userName = schedule.crew?.user?.name || 'Unknown';
                        const userInitial = userName !== 'Unknown' ? userName.charAt(0) : '?';
                        const crewType = schedule.crew?.crewType?.toUpperCase() || '';

                        return (
                            <div key={schedule.id || i} className="flex items-center justify-between p-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {userInitial}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white line-clamp-1">{userName}</p>
                                        <p className="text-[10px] text-emerald-400/70 uppercase">{crewType}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onUnassign(schedule.id)}
                                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/20 p-1 rounded transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-3 flex justify-between items-center pt-2 border-t border-slate-800/60">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onRecommend) onRecommend(flight);
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95"
                >
                    <Zap size={14} className="text-emerald-400 fill-emerald-400/30" /> AI Recommend & Assign
                </button>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium tracking-wide">CREW COUNT</span>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full">{assignedCrew.length}</span>
                </div>
            </div>
        </div>
    );
};


const SchedulerDashboard = () => {
    const [flights, setFlights] = useState([]);
    const [crew, setCrew] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState(null);
    const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [searchQuery, setSearchQuery] = useState('');

    // AI Smart Recommendation State
    const [selectedFlightForAI, setSelectedFlightForAI] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(false);
    const [assigningCrewId, setAssigningCrewId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const flightsRes = await api.get('/flights');
            setFlights(flightsRes.data);

            const rawFlights = flightsRes.data;
            if (rawFlights.length > 0) {
                const firstFlightDate = rawFlights[0].departureTime.slice(0, 10);
                setFilterDate(firstFlightDate);
            }
        } catch (err) {
            console.error('Failed to fetch flights', err);
            alert('API Error Fetching Flights: ' + (err.response?.data?.message || err.message));
        }

        try {
            const crewRes = await api.get('/crew');
            setCrew(crewRes.data);
        } catch (err) {
            console.error('Failed to fetch crew', err);
            alert('API Error Fetching Crew: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenAIRecommendations = async (flight) => {
        setSelectedFlightForAI(flight);
        setRecLoading(true);
        try {
            const res = await api.get(`/reports/fatigue/recommendations?flightId=${flight.id}`);
            setRecommendations(res.data.recommendations || []);
        } catch (err) {
            console.error('Failed to fetch AI recommendations', err);
            alert('Failed to load recommendations: ' + (err.response?.data?.message || err.message));
        } finally {
            setRecLoading(false);
        }
    };

    const handleQuickAssign = async (crewId) => {
        if (!selectedFlightForAI) return;
        setAssigningCrewId(crewId);
        try {
            await api.post('/schedules/assign', { flightId: selectedFlightForAI.id, crewId });
            await fetchData();
            // Re-fetch recommendations to update UI state
            const res = await api.get(`/reports/fatigue/recommendations?flightId=${selectedFlightForAI.id}`);
            setRecommendations(res.data.recommendations || []);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign crew member');
        } finally {
            setAssigningCrewId(null);
        }
    };

    const handleAutoGenerate = async () => {
        setGenerating(true);
        try {
            const res = await api.post('/schedules/generate');
            await fetchData();
            alert(`✅ ${res.data.flightsScheduled} flights assigned crew (${res.data.assignmentsMade} assignments made)`);
        } catch (err) {
            alert('Generation failed: ' + (err.response?.data?.message || 'Server error'));
        } finally { setGenerating(false); }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveDragItem(active.data.current?.crew);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const crewId = active.id.replace('crew-', '');
        const flightId = over.id.replace('flight-', '');

        try {
            await api.post('/schedules/assign', { flightId, crewId });
            await fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to assign crew');
        }
    };

    const handleUnassign = async (scheduleId) => {
        try {
            await api.delete(`/schedules/assign/${scheduleId}`);
            await fetchData();
            if (selectedFlightForAI) {
                const res = await api.get(`/reports/fatigue/recommendations?flightId=${selectedFlightForAI.id}`);
                setRecommendations(res.data.recommendations || []);
            }
        } catch (error) {
            console.error('Failed to unassign crew', error);
        }
    };

    let normalizedFilterDate = filterDate;
    if (filterDate && filterDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = filterDate.split('-');
        normalizedFilterDate = `${year}-${month}-${day}`;
    }

    const dayFlights = flights.filter(f => f.departureTime && f.departureTime.slice(0, 10) === normalizedFilterDate);

    const assignedCrewIdsToday = new Set();
    dayFlights.forEach(f => {
        (f.schedules || []).forEach(s => {
            if (s.crewId) assignedCrewIdsToday.add(s.crewId);
        });
    });

    const availableCrewForDay = crew.filter(c => {
        if (c.status !== 'active') return false;
        if (searchQuery && !c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (assignedCrewIdsToday.has(c.id)) return false;
        return true;
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col page-enter relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} style={{ color: '#0ea5e9' }} />
                        <span className="hud-label">INTERACTIVE SCHEDULER</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Assignment Board</h1>
                </div>
                <div className="flex gap-3">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="glass-input text-sm px-3 py-2! h-10.5 cursor-pointer"
                    />
                    <button onClick={handleAutoGenerate} disabled={generating} className="glass-button gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                        {generating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                        Auto-Generate All
                    </button>
                </div>
            </div>

            {/* DND Context area */}
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Left Sidebar: Available Crew */}
                    <div className="w-80 flex flex-col glass-card shrink-0">
                        <div className="p-4 border-b border-slate-800/60 bg-slate-900/40 rounded-t-2xl">
                            <h2 className="font-bold text-white flex items-center gap-2 text-sm mb-3">
                                <Users size={16} className="text-sky-400" />
                                Available Pool
                                <span className="ml-auto bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-300">{availableCrewForDay.length}</span>
                            </h2>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search crew..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
                                </div>
                            ) : availableCrewForDay.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                    <FileWarning size={24} className="mb-2 opacity-30" />
                                    <p className="text-sm">No available crew found</p>
                                </div>
                            ) : (
                                availableCrewForDay.map(c => (
                                    <DraggableCrew key={c.id} crew={c} isDragged={activeDragItem?.id === c.id} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Area: Flight Columns */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-2">
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 items-start">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="w-full h-56 skeleton rounded-2xl" />)
                            ) : dayFlights.length === 0 ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <Plane size={32} className="mb-3 opacity-20" />
                                    <p className="text-sm">No flights scheduled for this date.</p>
                                </div>
                            ) : (
                                dayFlights.map(flight =>
                                    <DroppableFlight
                                        key={flight.id}
                                        flight={flight}
                                        onUnassign={handleUnassign}
                                        onRecommend={handleOpenAIRecommendations}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay dropAnimation={null}>
                    {activeDragItem ? (
                        <div className="p-3 rounded-xl bg-slate-800 border-2 border-sky-500 shadow-2xl shadow-sky-900/20 w-72 opacity-90 scale-105 rotate-2 cursor-grabbing">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex justify-center items-center">
                                    {activeDragItem.user?.name?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{activeDragItem.user?.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{activeDragItem.crewType}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* AI Recommendation Drawer / Modal */}
            {selectedFlightForAI && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap size={16} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Recommendation Engine</span>
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    Flight {selectedFlightForAI.flightNumber} ({selectedFlightForAI.origin} → {selectedFlightForAI.destination})
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedFlightForAI(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs">
                                <span className="text-slate-400">ML Model: <strong className="text-emerald-400">Random Forest v1</strong></span>
                                <span className="text-slate-400">Active DB Ingested: <strong className="text-emerald-400">Live Sync</strong></span>
                            </div>

                            {recLoading ? (
                                <div className="space-y-4 pt-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
                                </div>
                            ) : recommendations.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <FileWarning size={32} className="mx-auto mb-2 opacity-30" />
                                    <p>No suitable crew recommendations found for this flight.</p>
                                </div>
                            ) : (
                                recommendations.map((cand) => {
                                    const isAssigned = (selectedFlightForAI.schedules || []).some(s => s.crewId === cand.crewId);

                                    return (
                                        <div
                                            key={cand.crewId}
                                            className={`p-4 rounded-2xl border transition-all ${isAssigned
                                                ? 'bg-emerald-950/20 border-emerald-500/40'
                                                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white text-base">{cand.name}</h3>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase">
                                                            {cand.crewType}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-0.5">{cand.qualification}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="hud-label text-[10px]">AI MATCH SCORE</span>
                                                    <div className="text-xl font-extrabold text-emerald-400">{cand.matchScore}%</div>
                                                </div>
                                            </div>

                                            {/* Match Score Bar */}
                                            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full"
                                                    style={{ width: `${cand.matchScore}%` }}
                                                />
                                            </div>

                                            {/* XAI Risk Factor Badges */}
                                            <div className="space-y-1.5 mb-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-400 font-medium">ML Fatigue Risk Score:</span>
                                                    <span className={`font-bold ${cand.riskClass === 'high' ? 'text-red-400' : cand.riskClass === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {cand.riskScore}/100 ({cand.riskClass.toUpperCase()})
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {cand.riskDrivers?.map((driver, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${driver.impact.startsWith('+')
                                                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}
                                                        >
                                                            {driver.label} ({driver.impact})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                                                {isAssigned ? (
                                                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                                                        <CheckCircle2 size={14} /> Assigned to Flight
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleQuickAssign(cand.crewId)}
                                                        disabled={assigningCrewId === cand.crewId}
                                                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                                    >
                                                        {assigningCrewId === cand.crewId ? (
                                                            <RefreshCw size={12} className="animate-spin" />
                                                        ) : (
                                                            <UserPlus size={14} />
                                                        )}
                                                        Auto-Assign Candidate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchedulerDashboard;
