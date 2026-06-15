const { PrismaClient } = require('@prisma/client');
const { findBestCrew } = require('../algorithms/scheduling');
const { sendEmail } = require('./emailService');
const prisma = new PrismaClient();

/**
 * Auto-generate schedule:
 * - For each un-scheduled flight, find eligible crew
 * - Eligibility: active status, available on that date, no overlapping flights
 * - Assigns up to minCrew members per flight based on system rule
 * - Uses scoring algorithm to rank crew and select best ones
 * - Respects "Min Crew Per Flight" system rule, max weekly hours, min rest
 */
const generateSchedule = async (actingUserId) => {
    // Fetch system rules
    const rules = await prisma.rule.findMany();
    const minCrewRule = rules.find(r => r.name === 'Min Crew Per Flight');
    const minCrew = minCrewRule ? Math.floor(minCrewRule.value) : 3;

    const maxWeeklyRule = rules.find(r => r.name === 'Max Weekly Duty Hours');
    const maxWeeklyHours = maxWeeklyRule ? maxWeeklyRule.value : 40;

    const minRestRule = rules.find(r => r.name === 'Min Rest Period');
    const minRestHours = minRestRule ? minRestRule.value : 10;

    // Fetch all flights with schedules
    const flights = await prisma.flight.findMany({
        include: { schedules: true },
        orderBy: { departureTime: 'asc' },
    });

    // Fetch all active crew with their schedules and availability
    // NOTE: Prisma schema uses `availableDate` not `date` on Availability model
    const allCrew = await prisma.crew.findMany({
        where: { status: 'active' },
        include: {
            user: true,
            availability: true,                         // { id, crewId, availableDate, status }
            schedules: { include: { flight: true } },   // existing scheduled flights
        },
    });

    const unscheduledFlights = flights.filter(
        f => f.schedules.length === 0 && f.status !== 'cancelled'
    );

    const newAssignments = [];
    // Track which flights each crew is being assigned to IN THIS RUN
    // to prevent overlapping assignments generated in the same batch
    const inRunCrewFlights = {}; // crewId -> Flight[]

    // Resolve the actor ID once
    let resolvedActorId = actingUserId;
    if (!resolvedActorId) {
        const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
        resolvedActorId = admin?.id ?? 1;
    }

    for (const flight of unscheduledFlights) {
        // Get the date string for this flight's departure (YYYY-MM-DD)
        const flightDepDate = new Date(flight.departureTime).toISOString().slice(0, 10);
        const flightWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(flight.departureTime).getUTCDay()];

        const availableCrew = allCrew.filter(crew => {
            if (crew.inactiveDayOfWeek && crew.inactiveDayOfWeek === flightWeekday) return false;

            // 1. Check availability record for that specific date
            //    The field in schema is `availableDate`, not `date`
            const avail = crew.availability.find(a => {
                const recordDate = new Date(a.availableDate).toISOString().slice(0, 10);
                return recordDate === flightDepDate;
            });
            // If record exists and is NOT 'available' or 'off' or 'on-leave' block the crew
            if (avail && avail.status !== 'available') return false;

            // 2. Check for overlapping EXISTING DB schedules
            const hasDBConflict = crew.schedules.some(s => {
                if (!s.flight) return false;
                const dep = new Date(flight.departureTime);
                const arr = new Date(flight.arrivalTime);
                const sDep = new Date(s.flight.departureTime);
                const sArr = new Date(s.flight.arrivalTime);
                return dep < sArr && arr > sDep;
            });
            if (hasDBConflict) return false;

            // 3. Check for conflicts with IN-RUN assignments
            const inRunFlights = inRunCrewFlights[crew.id] || [];
            const hasInRunConflict = inRunFlights.some(f => {
                const dep = new Date(flight.departureTime);
                const arr = new Date(flight.arrivalTime);
                const sDep = new Date(f.departureTime);
                const sArr = new Date(f.arrivalTime);
                return dep < sArr && arr > sDep;
            });
            if (hasInRunConflict) return false;

            // 4. Check weekly duty cap
            const weekStart = new Date(flight.departureTime);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weeklyHours = crew.schedules.reduce((acc, s) => {
                if (!s.flight) return acc;
                const sDate = new Date(s.flight.departureTime);
                if (sDate >= weekStart && sDate < weekEnd) {
                    acc += (new Date(s.flight.arrivalTime) - new Date(s.flight.departureTime)) / 3600000;
                }
                return acc;
            }, 0);

            const flightDuration = (new Date(flight.arrivalTime) - new Date(flight.departureTime)) / 3600000;
            if (weeklyHours + flightDuration > maxWeeklyHours) return false;

            return true;
        });

        if (availableCrew.length === 0) continue;

        // Build workload map for scoring
        const workloadMap = {};
        allCrew.forEach(c => {
            workloadMap[c.id] = c.schedules.reduce((acc, s) => {
                if (s.flight) acc += (new Date(s.flight.arrivalTime) - new Date(s.flight.departureTime)) / 3600000;
                return acc;
            }, 0);
        });

        // Calculate actual rest hours since each crew's last landing
        const crewWithRestHours = availableCrew.map(crew => {
            const sortedPast = crew.schedules
                .filter(s => s.flight && new Date(s.flight.arrivalTime) < new Date(flight.departureTime))
                .sort((a, b) => new Date(b.flight.arrivalTime) - new Date(a.flight.arrivalTime));

            const restHours = sortedPast.length > 0
                ? (new Date(flight.departureTime) - new Date(sortedPast[0].flight.arrivalTime)) / 3600000
                : 999; // No previous flights = max rest

            return { ...crew, restHours };
        });

        // Score, filter by min rest requirement, then pick top N
        const scored = findBestCrew(crewWithRestHours, flight, workloadMap, { minRestHours, maxWeeklyHours })
            .filter(c => c.restHours >= minRestHours);

        const numToAssign = Math.min(minCrew, scored.length);
        const selected = scored.slice(0, numToAssign);

        for (const c of selected) {
            newAssignments.push({
                flightId: flight.id,
                crewId: c.id,
                assignedById: resolvedActorId,
            });
            // Track in-run assignment to avoid double-booking
            if (!inRunCrewFlights[c.id]) inRunCrewFlights[c.id] = [];
            inRunCrewFlights[c.id].push(flight);
        }
    }

    // Save all at once, skipping duplicates (if flight already has this crew)
    if (newAssignments.length > 0) {
        const createdSchedules = await prisma.schedule.createManyAndReturn({
            data: newAssignments,
            skipDuplicates: true,
            include: { crew: { include: { user: true } }, flight: true }
        });

        // Create in-app system notifications
        const notificationsData = createdSchedules.map(schedule => ({
            userId: schedule.crew.userId,
            message: `You have been automatically assigned to flight ${schedule.flight.flightNumber} (${schedule.flight.origin} ✈️ ${schedule.flight.destination}) departing on ${new Date(schedule.flight.departureTime).toLocaleDateString()}.`,
            type: 'info'
        }));

        if (notificationsData.length > 0) {
            await prisma.notification.createMany({ data: notificationsData });
        }

        // Fire off email notifications for all newly generated assignments
        createdSchedules.forEach(schedule => {
            if (schedule.crew?.user?.email) {
                const flightTime = new Date(schedule.flight.departureTime).toLocaleString();
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0ea5e9;">Auto-Schedule Assignment</h2>
                        <p>Hello <strong>${schedule.crew.user.name}</strong>,</p>
                        <p>The system has automatically assigned you to a new flight.</p>
                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Flight Number:</strong> ${schedule.flight.flightNumber}</p>
                            <p style="margin: 5px 0;"><strong>Route:</strong> ${schedule.flight.origin} ✈️ ${schedule.flight.destination}</p>
                            <p style="margin: 5px 0;"><strong>Departure:</strong> ${flightTime}</p>
                        </div>
                        <p>Please log in to the SmartCrew portal to check your updated roster.</p>
                        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated message from the Smart Flight Crew Scheduling System.</p>
                    </div>
                `;
                sendEmail(schedule.crew.user.email, `Flight Assignment: ${schedule.flight.flightNumber}`, emailHtml);
            }
        });
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
        if (!schedule.flight) continue;

        const overlaps = schedule.crew.schedules.filter(s => {
            if (s.id === schedule.id || !s.flight) return false;
            const dep = new Date(schedule.flight.departureTime);
            const arr = new Date(schedule.flight.arrivalTime);
            const sDep = new Date(s.flight.departureTime);
            const sArr = new Date(s.flight.arrivalTime);
            return dep < sArr && arr > sDep;
        });

        if (overlaps.length > 0) {
            const key = [schedule.id, ...overlaps.map(o => o.id)].sort().join('-');
            if (!seen.has(key)) {
                seen.add(key);
                conflicts.push({
                    crewName: schedule.crew.user?.name ?? 'Unknown',
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
