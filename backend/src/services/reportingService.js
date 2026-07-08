const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { buildFatigueFeatures, scoreFatigueFeatures, predictFatigueMLBatch } = require('./fatigueRiskService');

const generateWorkloadReport = async () => {
    const crew = await prisma.crew.findMany({
        include: { user: true, schedules: { include: { flight: true } } }
    });

    const reportData = crew.map(c => {
        const totalHours = c.schedules.reduce((acc, s) => {
            const duration = (new Date(s.flight.arrivalTime) - new Date(s.flight.departureTime)) / (1000 * 60 * 60);
            return acc + duration;
        }, 0);

        return {
            crewName: c.user.name,
            crewType: c.crewType,
            totalFlights: c.schedules.length,
            totalHours: totalHours.toFixed(2),
            utilization: ((totalHours / c.maxHoursPerWeek) * 100).toFixed(2) + '%',
            utilizationPercent: parseFloat(((totalHours / c.maxHoursPerWeek) * 100).toFixed(2))
        };
    });

    return reportData;
};

const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
};

const getAdvancedAnalytics = async () => {
    // 1. Historical Line Chart: Fleet Delays Over Time (Next 7 days rolling)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const flights = await prisma.flight.findMany({
        where: { departureTime: { gte: today, lte: nextWeek } },
        orderBy: { departureTime: 'asc' }
    });

    const delaysByDay = {};
    flights.forEach(f => {
        const date = f.departureTime.toISOString().split('T')[0];
        if (!delaysByDay[date]) {
            delaysByDay[date] = { date, totalFlights: 0, delayedFlights: 0 };
        }
        delaysByDay[date].totalFlights++;
        if (f.status === 'delayed') {
            delaysByDay[date].delayedFlights++;
        }
    });
    const historicalDelays = Object.values(delaysByDay);

    // 2. Scatter Plot: Crew Duty Hours vs Notification Count (Fatigue Hotspots)
    const crewData = await prisma.crew.findMany({
        include: {
            schedules: { include: { flight: true } },
            user: { include: { notifications: true } }
        }
    });

    // 2.1 Build feature vectors for all crew members with active schedules to process them in batch
    const crewWithSchedules = crewData.filter(c => c.schedules.length > 0);
    const featuresList = crewWithSchedules.map(c => {
        const sortedSchedules = [...c.schedules].sort((a, b) => new Date(b.flight.departureTime) - new Date(a.flight.departureTime));
        const referenceFlight = sortedSchedules[0].flight;
        return {
            crewId: c.id,
            features: buildFatigueFeatures(c, referenceFlight)
        };
    });

    // 2.2 Execute predictions in batch (ML falls back to Heuristics internally if missing)
    let mlResults = null;
    if (featuresList.length > 0) {
        mlResults = predictFatigueMLBatch(featuresList.map(item => item.features));
    }
    if (!mlResults && featuresList.length > 0) {
        mlResults = featuresList.map(item => scoreFatigueFeatures(item.features));
    }

    // 2.3 Map results to a fast lookup object
    const scoreMap = {};
    if (mlResults) {
        featuresList.forEach((item, idx) => {
            scoreMap[item.crewId] = mlResults[idx].riskScore;
        });
    }

    // 2.4 Map crew fatigue details
    const crewFatigue = crewData.map(c => {
        const dutyHours = c.schedules.reduce((acc, s) => {
            const arr = new Date(s.flight.arrivalTime);
            const dep = new Date(s.flight.departureTime);
            return acc + ((arr - dep) / 3600000);
        }, 0);

        const fatigueScore = scoreMap[c.id] || 0;

        return {
            crewName: c.user.name,
            dutyHours: parseFloat(dutyHours.toFixed(2)),
            fatigueScore: fatigueScore,
            notifications: c.user.notifications.length,
            crewType: c.crewType
        };
    });

    return { historicalDelays, crewFatigue };
};

module.exports = { generateWorkloadReport, convertToCSV, getAdvancedAnalytics };
