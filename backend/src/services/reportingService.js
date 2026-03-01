const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = { generateWorkloadReport, convertToCSV };
