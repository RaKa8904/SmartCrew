const { PrismaClient } = require('@prisma/client');
const { buildFatigueFeatures, scoreFatigueFeatures } = require('../src/services/fatigueRiskService');

const prisma = new PrismaClient();
const MODEL_VERSION = 'heuristic-v1';

const airportPairs = [
    ['DEL', 'BOM'], ['BOM', 'DEL'], ['DXB', 'LHR'], ['LHR', 'DXB'],
    ['SIN', 'SYD'], ['SYD', 'SIN'], ['JFK', 'DOH'], ['DOH', 'JFK'],
    ['NRT', 'LAX'], ['LAX', 'NRT'], ['CDG', 'NRT'], ['FRA', 'LAX'],
    ['IST', 'JFK'], ['HKG', 'LHR'], ['AUH', 'MEL'], ['KUL', 'LHR'],
];

const aircraftByRoute = {
    long: ['Airbus A380', 'Boeing 777', 'Boeing 787', 'Airbus A350'],
    medium: ['Airbus A320', 'Boeing 737', 'Airbus A321'],
};

const crewTemplates = [
    { crewType: 'pilot', qualification: 'A380 Type Rated Captain', maxHoursPerWeek: 40 },
    { crewType: 'pilot', qualification: 'B777 Type Rated Captain', maxHoursPerWeek: 40 },
    { crewType: 'pilot', qualification: 'B787 First Officer', maxHoursPerWeek: 45 },
    { crewType: 'pilot', qualification: 'A320 First Officer', maxHoursPerWeek: 45 },
    { crewType: 'cabin', qualification: 'Senior Purser', maxHoursPerWeek: 48 },
    { crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50 },
    { crewType: 'cabin', qualification: 'Cabin Crew Junior', maxHoursPerWeek: 50 },
];

const randomBetween = (min, max) => min + (Math.random() * (max - min));
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));
const pick = (values) => values[Math.floor(Math.random() * values.length)];

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const makeFlightNumber = (index, routeIndex) => {
    const prefix = ['SC', 'AC', 'FX', 'TR'][routeIndex % 4];
    return `${prefix}${String(index + 1000).slice(-3)}`;
};

const buildCrewHistory = (crewIndex) => {
    const template = crewTemplates[crewIndex % crewTemplates.length];
    const dutyStart = new Date('2025-07-01T00:00:00Z');
    const historyMonths = randomInt(6, 12);
    const historyEnd = new Date(dutyStart);
    historyEnd.setUTCMonth(historyEnd.getUTCMonth() + historyMonths);

    const schedule = [];
    let cursor = new Date(dutyStart);

    while (cursor < historyEnd) {
        const crewPressure = Math.min(schedule.length / 12, 8);
        const timeOfDayBias = Math.random() < 0.35 + (crewPressure * 0.04);
        const [origin, destination] = pick(airportPairs);
        const departureHour = timeOfDayBias ? randomInt(0, 5) : randomInt(6, 23);
        const durationHours = destination === 'LHR' || origin === 'LHR' ? randomInt(7, 13) : randomInt(2, 10);
        const departureTime = new Date(cursor);
        departureTime.setUTCHours(departureHour, randomInt(0, 59), 0, 0);
        const arrivalTime = new Date(departureTime.getTime() + (durationHours * 60 * 60 * 1000));

        const flight = {
            departureTime,
            arrivalTime,
            origin,
            destination,
            flightNumber: makeFlightNumber(schedule.length, crewIndex),
            aircraftType: durationHours >= 6
                ? pick(aircraftByRoute.long)
                : pick(aircraftByRoute.medium),
        };

        schedule.push({ flight });

        const recoveryDays = Math.max(1, randomInt(1, 4) - (crewPressure > 5 ? 1 : 0));
        cursor = new Date(arrivalTime);
        cursor.setUTCDate(cursor.getUTCDate() + recoveryDays);

        if (Math.random() < 0.12) {
            cursor.setUTCDate(cursor.getUTCDate() + randomInt(1, 3));
        }
    }

    return {
        crewName: `Synthetic Crew ${String(crewIndex + 1).padStart(3, '0')}`,
        crewType: template.crewType,
        qualification: template.qualification,
        maxHoursPerWeek: template.maxHoursPerWeek,
        schedule,
    };
};

const labelFromScore = (score) => {
    if (score < 34) return 'low';
    if (score < 67) return 'medium';
    return 'high';
};

async function main() {
    await prisma.fatigueTrainingSample.deleteMany();

    const datasetRows = [];

    // 1. Ingest Active Database Flights & Schedules
    try {
        const activeCrew = await prisma.crew.findMany({
            include: {
                schedules: {
                    include: { flight: true }
                }
            }
        });

        const activeFlights = await prisma.flight.findMany();

        for (const crewMember of activeCrew) {
            const crewSchedules = crewMember.schedules.sort((a, b) => new Date(a.flight.departureTime) - new Date(b.flight.departureTime));

            for (let i = 0; i < crewSchedules.length; i++) {
                const currentSchedule = crewSchedules[i];
                const previousSchedules = crewSchedules.slice(0, i);

                const crewShape = {
                    id: crewMember.id,
                    crewType: crewMember.crewType,
                    qualification: crewMember.qualification,
                    maxHoursPerWeek: crewMember.maxHoursPerWeek,
                    status: crewMember.status,
                    schedules: previousSchedules
                };

                const features = buildFatigueFeatures(crewShape, currentSchedule.flight);
                const scored = scoreFatigueFeatures(features);

                datasetRows.push({
                    sampleKey: `active_db-${crewMember.id}-${formatDateKey(currentSchedule.flight.departureTime)}-${currentSchedule.flight.flightNumber}`,
                    crewName: crewMember.name || `Crew #${crewMember.id}`,
                    crewType: crewMember.crewType,
                    qualification: crewMember.qualification,
                    dutyDate: currentSchedule.flight.departureTime,
                    departureTime: currentSchedule.flight.departureTime,
                    arrivalTime: currentSchedule.flight.arrivalTime,
                    origin: currentSchedule.flight.origin,
                    destination: currentSchedule.flight.destination,
                    flightNumber: currentSchedule.flight.flightNumber,
                    aircraftType: currentSchedule.flight.aircraftType || 'Boeing 737',
                    featureVector: features,
                    labelScore: scored.riskScore,
                    labelClass: labelFromScore(scored.riskScore),
                    noiseApplied: 0.0,
                    dataSource: 'active_db',
                    modelVersion: MODEL_VERSION,
                });
            }
        }
        console.log(`Ingested ${datasetRows.length} active database fatigue samples.`);
    } catch (err) {
        console.warn('Could not ingest active DB records, falling back to synthetic:', err.message);
    }

    // 2. Synthetic History Generation
    const crewCount = 150;

    for (let crewIndex = 0; crewIndex < crewCount; crewIndex += 1) {
        const crewHistory = buildCrewHistory(crewIndex);
        const duties = crewHistory.schedule;

        for (let dutyIndex = 0; dutyIndex < duties.length; dutyIndex += 1) {
            const currentDuty = duties[dutyIndex];
            const previousDuties = duties.slice(0, dutyIndex);
            const crewShape = {
                id: crewIndex + 1,
                crewType: crewHistory.crewType,
                qualification: crewHistory.qualification,
                maxHoursPerWeek: crewHistory.maxHoursPerWeek,
                status: 'active',
                schedules: previousDuties,
            };

            const features = buildFatigueFeatures(crewShape, currentDuty.flight);
            const scored = scoreFatigueFeatures(features);
            const noise = Number(randomBetween(-4.5, 4.5).toFixed(2));
            const noisyScore = Math.max(0, Math.min(100, Number((scored.riskScore + noise).toFixed(2))));

            datasetRows.push({
                sampleKey: `${crewIndex + 1}-${formatDateKey(currentDuty.flight.departureTime)}-${currentDuty.flight.flightNumber}`,
                crewName: crewHistory.crewName,
                crewType: crewHistory.crewType,
                qualification: crewHistory.qualification,
                dutyDate: currentDuty.flight.departureTime,
                departureTime: currentDuty.flight.departureTime,
                arrivalTime: currentDuty.flight.arrivalTime,
                origin: currentDuty.flight.origin,
                destination: currentDuty.flight.destination,
                flightNumber: currentDuty.flight.flightNumber,
                aircraftType: currentDuty.flight.aircraftType,
                featureVector: features,
                labelScore: noisyScore,
                labelClass: labelFromScore(noisyScore),
                noiseApplied: noise,
                dataSource: 'synthetic',
                modelVersion: MODEL_VERSION,
            });
        }
    }

    const batchSize = 250;
    for (let i = 0; i < datasetRows.length; i += batchSize) {
        const batch = datasetRows.slice(i, i + batchSize);
        await prisma.fatigueTrainingSample.createMany({ data: batch });
    }

    console.log(`Generated total of ${datasetRows.length} fatigue training samples for model training.`);
}

main()
    .catch((error) => {
        console.error('Fatigue dataset generation failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });