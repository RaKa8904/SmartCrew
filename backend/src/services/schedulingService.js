const { PrismaClient } = require('@prisma/client');
const { findBestCrew } = require('../algorithms/scheduling');
const prisma = new PrismaClient();

const generateSchedule = async () => {
    const flights = await prisma.flight.findMany({
        include: { schedules: true }
    });
    const crew = await prisma.crew.findMany({
        include: { user: true, schedules: { include: { flight: true } } }
    });

    const unscheduledFlights = flights.filter(f => f.schedules.length === 0);
    const assignments = [];

    for (const flight of unscheduledFlights) {
        // 1. Filter available crew
        const availableCrew = crew.filter(c => {
            // Basic check: not already assigned to a flight at the same time
            const isOverlapping = c.schedules.some(s => {
                return (flight.departureTime >= s.flight.departureTime && flight.departureTime <= s.flight.arrivalTime) ||
                    (flight.arrivalTime >= s.flight.departureTime && flight.arrivalTime <= s.flight.arrivalTime);
            });
            return !isOverlapping && c.status === 'active';
        });

        // 2. Identify best crew using AI scoring
        const bestCrew = findBestCrew(availableCrew, flight, {}); // Workload map omitted for simplicity

        if (bestCrew.length > 0) {
            assignments.push({
                flightId: flight.id,
                crewId: bestCrew[0].id,
                assignedById: 1, // System default or current user
            });
        }
    }

    // 3. Save schedules
    if (assignments.length > 0) {
        await prisma.schedule.createMany({ data: assignments });
    }

    return assignments;
};

const getConflicts = async () => {
    const schedules = await prisma.schedule.findMany({
        include: { flight: true, crew: { include: { schedules: { include: { flight: true } } } } }
    });

    const conflicts = [];
    for (const schedule of schedules) {
        const overlaps = schedule.crew.schedules.filter(s => {
            if (s.id === schedule.id) return false;
            return (schedule.flight.departureTime >= s.flight.departureTime && schedule.flight.departureTime <= s.flight.arrivalTime) ||
                (schedule.flight.arrivalTime >= s.flight.departureTime && schedule.flight.arrivalTime <= s.flight.arrivalTime);
        });

        if (overlaps.length > 0) {
            conflicts.push({ schedule, overlaps });
        }
    }

    return conflicts;
};

module.exports = { generateSchedule, getConflicts };
