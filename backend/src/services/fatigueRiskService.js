const { PrismaClient } = require('@prisma/client');
const airportCoordinates = require('../utils/airportCoordinates');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const prisma = new PrismaClient();
const FATIGUE_MODEL_VERSION = 'heuristic-v1';
const MODEL_PATH = path.join(__dirname, '../../artifacts/fatigue/fatigue_model_v1.pkl');
const PREDICT_SCRIPT_PATH = path.join(__dirname, '../../scripts/predict-fatigue.py');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getAirportOffsetHours = (airportCode) => {
    const airport = airportCoordinates[airportCode];
    if (!airport) return 0;

    return airport.lng / 15;
};

const toAirportLocalDate = (value, airportCode) => {
    const offsetMs = getAirportOffsetHours(airportCode) * 60 * 60 * 1000;
    return new Date(new Date(value).getTime() + offsetMs);
};

const countHoursInWindow = (schedules, referenceTime, windowHours) => {
    const windowStart = new Date(referenceTime.getTime() - (windowHours * 60 * 60 * 1000));

    return schedules.reduce((total, schedule) => {
        if (!schedule.flight) return total;

        const departureTime = new Date(schedule.flight.departureTime);
        if (departureTime < windowStart || departureTime >= referenceTime) return total;

        const flightHours = (new Date(schedule.flight.arrivalTime) - departureTime) / 3600000;
        return total + Math.max(flightHours, 0);
    }, 0);
};

const getConsecutiveDutyDays = (schedules, referenceTime) => {
    const dutyDays = new Set(
        schedules
            .filter((schedule) => schedule.flight && new Date(schedule.flight.departureTime) < referenceTime)
            .map((schedule) => new Date(schedule.flight.departureTime).toISOString().slice(0, 10))
    );

    const cursor = new Date(referenceTime);
    cursor.setUTCHours(0, 0, 0, 0);

    let consecutiveDays = 0;
    while (consecutiveDays < 31) {
        const dayKey = cursor.toISOString().slice(0, 10);
        if (!dutyDays.has(dayKey)) break;

        consecutiveDays += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return consecutiveDays;
};

const getLastRestHours = (schedules, referenceTime) => {
    const pastFlights = schedules
        .filter((schedule) => schedule.flight && new Date(schedule.flight.arrivalTime) < referenceTime)
        .sort((left, right) => new Date(right.flight.arrivalTime) - new Date(left.flight.arrivalTime));

    if (pastFlights.length === 0) {
        return 999;
    }

    const mostRecentArrival = new Date(pastFlights[0].flight.arrivalTime);
    return (referenceTime - mostRecentArrival) / 3600000;
};

const getFlightCircadianFlags = (flight) => {
    const departureLocal = toAirportLocalDate(flight.departureTime, flight.origin);
    const arrivalLocal = toAirportLocalDate(flight.arrivalTime, flight.destination);

    const departureHour = departureLocal.getHours();
    const arrivalHour = arrivalLocal.getHours();

    return {
        departureLocalHour: departureHour,
        arrivalLocalHour: arrivalHour,
        isEarlyMorningDeparture: departureHour >= 0 && departureHour < 6,
        isLateNightDeparture: departureHour >= 22,
        isOvernightArrival: arrivalHour >= 0 && arrivalHour < 6,
    };
};

const buildFatigueFeatures = (crew, referenceFlight) => {
    const referenceTime = new Date(referenceFlight.departureTime);
    const schedules = crew.schedules || [];

    const dutyHours24 = countHoursInWindow(schedules, referenceTime, 24);
    const dutyHours7d = countHoursInWindow(schedules, referenceTime, 24 * 7);
    const dutyHours28d = countHoursInWindow(schedules, referenceTime, 24 * 28);
    const hoursSinceLastRest = getLastRestHours(schedules, referenceTime);
    const consecutiveDutyDays = getConsecutiveDutyDays(schedules, referenceTime);

    const originOffset = getAirportOffsetHours(referenceFlight.origin);
    const destinationOffset = getAirportOffsetHours(referenceFlight.destination);
    const timezoneCrossings = Math.round(Math.abs(destinationOffset - originOffset));

    const circadianFlags = getFlightCircadianFlags(referenceFlight);
    const nightFlightCount = schedules.reduce((total, schedule) => {
        if (!schedule.flight) return total;

        const departureLocal = toAirportLocalDate(schedule.flight.departureTime, schedule.flight.origin);
        const localHour = departureLocal.getHours();
        if (localHour >= 22 || localHour < 6) return total + 1;
        return total;
    }, 0);

    return {
        dutyHours24: Number(dutyHours24.toFixed(2)),
        dutyHours7d: Number(dutyHours7d.toFixed(2)),
        dutyHours28d: Number(dutyHours28d.toFixed(2)),
        hoursSinceLastRest: Number(hoursSinceLastRest.toFixed(2)),
        consecutiveDutyDays,
        timezoneCrossings,
        nightFlightCount,
        ...circadianFlags,
    };
};

const scoreFatigueFeatures = (features) => {
    const contributions = [
        {
            key: 'restGap',
            label: 'Short rest window',
            value: features.hoursSinceLastRest,
            contribution: clamp(((12 - features.hoursSinceLastRest) / 12) * 30, 0, 30),
        },
        {
            key: 'duty24',
            label: 'High 24-hour duty load',
            value: features.dutyHours24,
            contribution: clamp((features.dutyHours24 / 8) * 20, 0, 20),
        },
        {
            key: 'duty7d',
            label: 'High 7-day duty load',
            value: features.dutyHours7d,
            contribution: clamp((features.dutyHours7d / 40) * 20, 0, 20),
        },
        {
            key: 'duty28d',
            label: 'Sustained 28-day workload',
            value: features.dutyHours28d,
            contribution: clamp((features.dutyHours28d / 120) * 10, 0, 10),
        },
        {
            key: 'streak',
            label: 'Consecutive duty days',
            value: features.consecutiveDutyDays,
            contribution: clamp((features.consecutiveDutyDays / 6) * 10, 0, 10),
        },
        {
            key: 'timezone',
            label: 'Timezone crossings',
            value: features.timezoneCrossings,
            contribution: clamp((features.timezoneCrossings / 4) * 5, 0, 5),
        },
        {
            key: 'circadian',
            label: 'Circadian disruption',
            value: {
                earlyMorning: features.isEarlyMorningDeparture,
                lateNight: features.isLateNightDeparture,
                overnightArrival: features.isOvernightArrival,
            },
            contribution: (features.isEarlyMorningDeparture ? 3 : 0)
                + (features.isLateNightDeparture ? 3 : 0)
                + (features.isOvernightArrival ? 4 : 0),
        },
    ];

    const fatigueScore = Math.round(
        contributions.reduce((total, item) => total + item.contribution, 0)
    );

    const riskScore = clamp(fatigueScore, 0, 100);
    const riskClass = riskScore < 34 ? 'low' : riskScore < 67 ? 'medium' : 'high';

    const topFactors = contributions
        .filter((item) => item.contribution > 0)
        .sort((left, right) => right.contribution - left.contribution)
        .slice(0, 3)
        .map((item) => ({
            key: item.key,
            label: item.label,
            value: item.value,
            contribution: Number(item.contribution.toFixed(2)),
        }));

    const riskDrivers = topFactors.map((item) => ({
        factor: item.key,
        label: item.label,
        impact: `+${Math.round(item.contribution)}%`
    }));

    if (riskDrivers.length === 0) {
        riskDrivers.push({
            factor: 'adequateRest',
            label: 'Adequate Rest & Balanced Roster',
            impact: '-20%'
        });
    }

    return {
        riskScore,
        riskClass,
        topFactors,
        riskDrivers,
    };
};

const predictFatigueML = (features) => {
    if (!fs.existsSync(MODEL_PATH)) {
        return null;
    }

    try {
        const result = execFileSync('python', [
            PREDICT_SCRIPT_PATH,
            MODEL_PATH,
            JSON.stringify(features)
        ], { encoding: 'utf-8', timeout: 15000 });

        const parsed = JSON.parse(result.trim());
        if (parsed.status === 'success') {
            const res = parsed.results;
            const pHigh = res?.probabilities?.high || 0;
            const pMedium = res?.probabilities?.medium || 0;
            const riskScore = Math.round((pMedium * 50) + (pHigh * 100));

            return {
                riskScore,
                riskClass: res?.riskClass || 'low',
                topFactors: [],
                isML: true
            };
        }
    } catch (err) {
        console.error('Failed to run ML prediction subprocess:', err.message);
    }
    return null;
};

const predictFatigueMLBatch = (featuresArray) => {
    if (!fs.existsSync(MODEL_PATH)) {
        return null;
    }

    try {
        const result = execFileSync('python', [
            PREDICT_SCRIPT_PATH,
            MODEL_PATH,
            JSON.stringify(featuresArray)
        ], { encoding: 'utf-8', timeout: 5000 });

        const parsed = JSON.parse(result.trim());
        if (parsed && parsed.status === 'success') {
            const items = Array.isArray(parsed.results) ? parsed.results : [parsed.results];
            return items.map((res) => {
                const probs = res.probabilities || {};
                const pHigh = probs.high || 0;
                const pMedium = probs.medium || 0;
                const riskScore = Math.round((pMedium * 50) + (pHigh * 100));

                return {
                    riskScore,
                    riskClass: res.riskClass || 'low',
                    riskDrivers: res.riskDrivers || [],
                    isML: true
                };
            });
        }
    } catch (err) {
        console.error('Failed to run ML prediction batch subprocess:', err.message);
    }
    return null;
};

const buildFatiguePreview = (crew, referenceFlight) => {
    const features = buildFatigueFeatures(crew, referenceFlight);
    let scored = predictFatigueML(features);
    let modelVersion = 'fatigue_model_v1';

    if (!scored) {
        scored = scoreFatigueFeatures(features);
        modelVersion = FATIGUE_MODEL_VERSION;
    }

    return {
        crew: {
            id: crew.id,
            crewType: crew.crewType,
            qualification: crew.qualification,
            status: crew.status,
            user: crew.user
                ? {
                    id: crew.user.id,
                    name: crew.user.name,
                    email: crew.user.email,
                }
                : null,
        },
        referenceFlight: {
            id: referenceFlight.id,
            flightNumber: referenceFlight.flightNumber,
            origin: referenceFlight.origin,
            destination: referenceFlight.destination,
            departureTime: referenceFlight.departureTime,
            arrivalTime: referenceFlight.arrivalTime,
        },
        modelVersion,
        features,
        ...scored,
    };
};

const getFatiguePreview = async ({ flightId, crewId }) => {
    const parsedFlightId = Number.parseInt(flightId, 10);
    if (Number.isNaN(parsedFlightId)) {
        const error = new Error('flightId is required');
        error.statusCode = 400;
        throw error;
    }

    const referenceFlight = await prisma.flight.findUnique({
        where: { id: parsedFlightId },
    });

    if (!referenceFlight) {
        const error = new Error('Flight not found');
        error.statusCode = 404;
        throw error;
    }

    const parsedCrewId = crewId ? Number.parseInt(crewId, 10) : null;
    const crewWhere = parsedCrewId
        ? { id: parsedCrewId, status: 'active' }
        : { status: 'active' };

    const crewList = await prisma.crew.findMany({
        where: crewWhere,
        include: {
            user: true,
            schedules: { include: { flight: true } },
        },
    });

    const featuresList = crewList.map((crew) => buildFatigueFeatures(crew, referenceFlight));

    let mlResults = predictFatigueMLBatch(featuresList);

    if (!mlResults) {
        mlResults = featuresList.map((features) => scoreFatigueFeatures(features));
    }

    const previews = crewList.map((crew, idx) => {
        const features = featuresList[idx];
        const scored = mlResults[idx] || scoreFatigueFeatures(features);

        return {
            crew: {
                id: crew.id,
                crewType: crew.crewType,
                qualification: crew.qualification,
                status: crew.status,
                user: crew.user
                    ? {
                        id: crew.user.id,
                        name: crew.user.name,
                        email: crew.user.email,
                    }
                    : null,
            },
            referenceFlight: {
                id: referenceFlight.id,
                flightNumber: referenceFlight.flightNumber,
                origin: referenceFlight.origin,
                destination: referenceFlight.destination,
                departureTime: referenceFlight.departureTime,
                arrivalTime: referenceFlight.arrivalTime,
            },
            modelVersion: scored.isML ? 'fatigue_model_v1' : FATIGUE_MODEL_VERSION,
            features,
            ...scored,
        };
    }).sort((left, right) => right.riskScore - left.riskScore);

    if (parsedCrewId && previews.length === 0) {
        const error = new Error('Crew member not found or inactive');
        error.statusCode = 404;
        throw error;
    }

    return {
        referenceFlight: {
            id: referenceFlight.id,
            flightNumber: referenceFlight.flightNumber,
            origin: referenceFlight.origin,
            destination: referenceFlight.destination,
            departureTime: referenceFlight.departureTime,
            arrivalTime: referenceFlight.arrivalTime,
        },
        modelVersion: previews.length > 0 ? previews[0].modelVersion : FATIGUE_MODEL_VERSION,
        preview: parsedCrewId ? previews[0] : undefined,
        previews: parsedCrewId ? undefined : previews,
    };
};

const getSmartRecommendations = async (flightId) => {
    const flight = await prisma.flight.findUnique({
        where: { id: parseInt(flightId, 10) },
        include: { schedules: { include: { crew: true } } }
    });

    if (!flight) {
        const error = new Error('Flight not found');
        error.statusCode = 404;
        throw error;
    }

    const allCrew = await prisma.crew.findMany({
        where: { status: 'active' },
        include: {
            user: { select: { id: true, name: true, email: true } },
            schedules: { include: { flight: true } }
        }
    });

    const featuresList = allCrew.map((crewMember) => buildFatigueFeatures(crewMember, flight));
    let mlResults = predictFatigueMLBatch(featuresList);

    if (!mlResults) {
        mlResults = featuresList.map((features) => scoreFatigueFeatures(features));
    }

    const evaluated = allCrew.map((crewMember, idx) => {
        const res = mlResults[idx] || scoreFatigueFeatures(featuresList[idx]);
        const riskScore = Math.round(res.riskScore || 0);
        const riskClass = res.riskClass || 'low';
        const riskDrivers = res.riskDrivers || res.topFactors || [];
        const isML = res.isML || false;

        let isQualified = true;
        if (flight.requiredQualification && crewMember.qualification !== flight.requiredQualification) {
            isQualified = false;
        }

        const matchScore = Math.max(0, Math.min(100, Math.round(100 - (riskScore * 0.7) - (isQualified ? 0 : 40))));

        return {
            crewId: crewMember.id,
            name: crewMember.name || (crewMember.user ? crewMember.user.name : `Crew #${crewMember.id}`),
            crewType: crewMember.crewType,
            qualification: crewMember.qualification,
            isQualified,
            riskScore,
            riskClass,
            matchScore,
            riskDrivers,
            isML
        };
    });

    return evaluated.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = {
    getFatiguePreview,
    buildFatiguePreview,
    buildFatigueFeatures,
    scoreFatigueFeatures,
    predictFatigueMLBatch,
    getSmartRecommendations,
};