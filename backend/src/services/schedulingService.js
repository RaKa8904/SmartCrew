const { PrismaClient } = require('@prisma/client');
const { findBestCrew } = require('../algorithms/scheduling');
const prisma = new PrismaClient();

/**
 * Auto-generate schedule:
 * - For each un-scheduled flight, find eligible crew
 * - Eligibility: active status, available on that date, no overlapping flights
 * - Assigns min(minCrewRequired, availableCrew.length) crew per flight
 * - Uses scoring algorithm to rank crew and select best ones
 * - Respects "Min Crew Per Flight" system rule
 * - Uses actual rest hours since last flight for scoring
 */
const generateSchedule = async (actingUserId) => {
    // Fetch system rules for min crew per flight
    const rules = await prisma.rule.findMany();
    const minCrewRule = rules.find(r => r.name === 'Min Crew Per Flight');
    const minCrew = minCrewRule ? Math.floor(minCrewRule.value) : 3;

    const maxWeeklyRule = rules.find(r => r.name === 'Max Weekly Duty Hours');
    const maxWeeklyHours = maxWeeklyRule ? maxWeeklyRule.value : 40;

    const minRestRule = rules.find(r => r.name === 'Min Rest Period');
    const minRestHours = minRestRule ? minRestRule.value : 10;

    // Fetch all flights not yet scheduled (no schedules at all)
    const flights = await prisma.flight.findMany({
        include: { schedules: true },
        orderBy: { departureTime: 'asc' },
    });

    // Fetch all crew with their schedules and user info
    const allCrew = await prisma.crew.findMany({
        where: { status: 'active' },
        include: {
            user: true,
            schedules: { include: { flight: true } },
            availability: true,
        },
    });

    const unscheduledFlights = flights.filter(f => f.schedules.length === 0 && f.status !== 'cancelled');
    const newAssignments = [];
    const assignedCrewThisRun = {}; // track assignments made in this run: crewId -> [flightIds]

    for (const flight of unscheduledFlights) {
        const flightDepDate = new Date(flight.departureTime).toISOString().slice(0, 10);

        const availableCrew = allCrew.filter(crew => {
            // 1. Check availability record for that day
            const avail = crew.availability.find(a =>
                new Date(a.date).toISOString().slice(0, 10) === flightDepDate
            );
            // If there's an explicit record, it must be "available". If no record, assume available.
            if (avail && avail.status !== 'available') return false;

            // 2. Check for overlapping existing schedules (from DB)
            const hasDBConflict = crew.schedules.some(s => {
                if (!s.flight) return false;
                const dep = new Date(flight.departureTime);
                const arr = new Date(flight.arrivalTime);
                const sDep = new Date(s.flight.departureTime);
                const sArr = new Date(s.flight.arrivalTime);
                return dep < sArr && arr > sDep; // overlap check
            });
            if (hasDBConflict) return false;

            // 3. Check overlapping with assignments made IN THIS RUN
            const thisRunFlightIds = assignedCrewThisRun[crew.id] || [];
            const hasThisRunConflict = thisRunFlightIds.some(fid => {
                const otherFlight = flights.find(f => f.id === fid);
                if (!otherFlight) return false;
                const dep = new Date(flight.departureTime);
                const arr = new Date(flight.arrivalTime);
                const sDep = new Date(otherFlight.departureTime);
                const sArr = new Date(otherFlight.arrivalTime);
                return dep < sArr && arr > sDep;
            });
            if (hasThisRunConflict) return false;

            // 4. Check weekly duty hours (sum of past flight durations this week)
            const weekStart = new Date(flight.departureTime);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weeklyHours = crew.schedules.reduce((acc, s) => {
                const sDate = new Date(s.flight?.departureTime);
                if (sDate >= weekStart && sDate < weekEnd && s.flight) {
                    acc += (new Date(s.flight.arrivalTime) - new Date(s.flight.departureTime)) / 3600000;
                }
                return acc;
            }, 0);

            const flightDuration = (new Date(flight.arrivalTime) - new Date(flight.departureTime)) / 3600000;
            if (weeklyHours + flightDuration > maxWeeklyHours) return false;

            return true;
        });

        if (availableCrew.length === 0) continue;

        // Build workload map for scoring: crewId -> total scheduled hours
        const workloadMap = {};
        allCrew.forEach(c => {
            workloadMap[c.id] = c.schedules.reduce((acc, s) => {
                if (s.flight) acc += (new Date(s.flight.arrivalTime) - new Date(s.flight.departureTime)) / 3600000;
                return acc;
            }, 0);
        });

        // Calculate actual rest hours since last flight for each crew member
        const crewWithRestHours = availableCrew.map(crew => {
            const lastFlight = crew.schedules
                .filter(s => s.flight && new Date(s.flight.arrivalTime) < new Date(flight.departureTime))
                .sort((a, b) => new Date(b.flight.arrivalTime) - new Date(a.flight.arrivalTime))[0];

            const restHours = lastFlight
                ? (new Date(flight.departureTime) - new Date(lastFlight.flight.arrivalTime)) / 3600000
                : 999; // No previous flight = maximum rest

            return { ...crew, restHours };
        });

        // Score and sort crew, filter by minimum rest
        const scored = findBestCrew(crewWithRestHours, flight, workloadMap)
            .filter(c => c.restHours >= minRestHours);

        // Assign up to minCrew crew members (or all available if fewer)
        const numToAssign = Math.min(minCrew, scored.length);
        const selectedCrew = scored.slice(0, numToAssign);

        // Determine the acting user id (scheduler/admin who triggered it)
        const resolvedActorId = actingUserId || (await prisma.user.findFirst({ where: { role: 'admin' } }))?.id || 1;

        for (const c of selectedCrew) {
            newAssignments.push({
                flightId: flight.id,
                crewId: c.id,
                assignedById: resolvedActorId,
            });
            // Track in-run assignments to prevent conflicts
            if (!assignedCrewThisRun[c.id]) assignedCrewThisRun[c.id] = [];
            assignedCrewThisRun[c.id].push(flight.id);
        }
    }

    // Save all assignments at once
    if (newAssignments.length > 0) {
        await prisma.schedule.createMany({ data: newAssignments });
    }

    return {
        flightsProcessed: unscheduledFlights.length,
        assignmentsMade: newAssignments.length,
        flightsScheduled: [...new Set(newAssignments.map(a => a.flightId))].length,
    };
};

/**
 * Detect scheduling conflicts — two schedules for same crew with overlapping times
 */
const getConflicts = async () => {
    const schedules = await prisma.schedule.findMany({
        include: {
            flight: true,
            crew: {
                include: {
                    user: true,
                    schedules: { include: { flight: true } },
                },
            },
        },
    });

    const conflicts = [];
    const seen = new Set();

    for (const schedule of schedules) {
        const overlaps = schedule.crew.schedules.filter(s => {
            if (s.id === schedule.id) return false;
            if (!s.flight || !schedule.flight) return false;
            const dep = new Date(schedule.flight.departureTime);
            const arr = new Date(schedule.flight.arrivalTime);
            const sDep = new Date(s.flight.departureTime);
            const sArr = new Date(s.flight.arrivalTime);
            return dep < sArr && arr > sDep; // proper overlap check
        });

        if (overlaps.length > 0) {
            const key = [schedule.id, ...overlaps.map(o => o.id)].sort().join('-');
            if (!seen.has(key)) {
                seen.add(key);
                conflicts.push({
                    crewName: schedule.crew.user.name,
                    crewId: schedule.crew.id,
                    flight1: `${schedule.flight.flightNumber} (${schedule.flight.origin}→${schedule.flight.destination})`,
                    flight2: overlaps.map(o => `${o.flight.flightNumber} (${o.flight.origin}→${o.flight.destination})`).join(', '),
                    departureTime1: schedule.flight.departureTime,
                    departureTime2: overlaps[0]?.flight.departureTime,
                });
            }
        }
    }

    return conflicts;
};

module.exports = { generateSchedule, getConflicts };
