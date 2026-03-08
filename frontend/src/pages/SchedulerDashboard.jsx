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
const DroppableFlight = ({ flight, onUnassign }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `flight-${flight.id}`,
        data: { flight }
    });

    // flight.schedules already contains nested { crew: { user: {...} } }
    const assignedCrew = flight.schedules || [];

    return (
        <div ref={setNodeRef} className={`glass-card p-4 w-full transition-all ${isOver ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 bg-emerald-900/10' : ''}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-3">
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

            <div className="space-y-2 min-h-20 p-2 rounded-xl bg-slate-950/30 border border-dashed border-slate-800">
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
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
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

            <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium tracking-wide">CREW COUNT</span>
                <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full">{assignedCrew.length}</span>
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const flightsRes = await api.get('/flights');
            setFlights(flightsRes.data);

            // Auto-snap the date filter to the first available flight date
            // if the current filterDate has no flights scheduled
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
        } catch (error) {
            console.error('Failed to unassign crew', error);
        }
    };

    // Normalize filterDate to ensure it's in YYYY-MM-DD format
    let normalizedFilterDate = filterDate;
    if (filterDate && filterDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = filterDate.split('-');
        normalizedFilterDate = `${year}-${month}-${day}`;
    }

    // Filter flights by selected date
    const dayFlights = flights.filter(f => f.departureTime && f.departureTime.slice(0, 10) === normalizedFilterDate);

    // Build a set of crewIds that are assigned to flights today (from flight.schedules)
    const assignedCrewIdsToday = new Set();
    dayFlights.forEach(f => {
        (f.schedules || []).forEach(s => {
            if (s.crewId) assignedCrewIdsToday.add(s.crewId);
        });
    });

    const availableCrewForDay = crew.filter(c => {
        if (c.status !== 'active') return false;
        if (searchQuery && !c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        // Hide crew already assigned to a flight today
        if (assignedCrewIdsToday.has(c.id)) return false;
        return true;
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col page-enter">
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
                        <div className="flex flex-col gap-4 h-full items-stretch">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="w-full h-64 skeleton rounded-2xl" />)
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
        </div>
    );
};

export default SchedulerDashboard;
