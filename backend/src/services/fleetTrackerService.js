const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const airportCoordinates = require('../utils/airportCoordinates');

// ── Simulated international routes (MAP-ONLY, never touch the DB) ────────────
// Each route loops every `durationMs`. A stagger offset spreads them across the globe.
const INTL_ROUTES = [
    // Transatlantic
    { id: 'intl-1', flightNumber: 'BA117', origin: 'LHR', destination: 'JFK', durationMs: 8 * 3600e3, staggerMin: 0 },
    { id: 'intl-2', flightNumber: 'AF007', origin: 'CDG', destination: 'JFK', durationMs: 8 * 3600e3, staggerMin: 45 },
    { id: 'intl-3', flightNumber: 'LH400', origin: 'FRA', destination: 'JFK', durationMs: 9 * 3600e3, staggerMin: 90 },
    { id: 'intl-4', flightNumber: 'AA100', origin: 'JFK', destination: 'LHR', durationMs: 7 * 3600e3, staggerMin: 30 },
    // Transpacific
    { id: 'intl-5', flightNumber: 'SQ11', origin: 'SIN', destination: 'SFO', durationMs: 17 * 3600e3, staggerMin: 60 },
    { id: 'intl-6', flightNumber: 'NH105', origin: 'NRT', destination: 'LAX', durationMs: 10 * 3600e3, staggerMin: 120 },
    { id: 'intl-7', flightNumber: 'QF11', origin: 'SYD', destination: 'LAX', durationMs: 14 * 3600e3, staggerMin: 200 },
    { id: 'intl-8', flightNumber: 'CX880', origin: 'HKG', destination: 'LAX', durationMs: 12 * 3600e3, staggerMin: 150 },
    // Gulf Hub routes
    { id: 'intl-9', flightNumber: 'EK001', origin: 'DXB', destination: 'LHR', durationMs: 7 * 3600e3, staggerMin: 15 },
    { id: 'intl-10', flightNumber: 'QR777', origin: 'DOH', destination: 'SYD', durationMs: 14 * 3600e3, staggerMin: 100 },
    { id: 'intl-11', flightNumber: 'EK231', origin: 'DXB', destination: 'BOM', durationMs: 3 * 3600e3, staggerMin: 20 },
    // South America / Africa
    { id: 'intl-12', flightNumber: 'LA800', origin: 'GRU', destination: 'CDG', durationMs: 11 * 3600e3, staggerMin: 180 },
    { id: 'intl-13', flightNumber: 'ET302', origin: 'ADD', destination: 'LHR', durationMs: 8 * 3600e3, staggerMin: 75 },
    { id: 'intl-14', flightNumber: 'SA203', origin: 'JNB', destination: 'LHR', durationMs: 11 * 3600e3, staggerMin: 140 },
    // Intra-Asia
    { id: 'intl-15', flightNumber: 'KE001', origin: 'ICN', destination: 'SIN', durationMs: 6 * 3600e3, staggerMin: 40 },
    { id: 'intl-16', flightNumber: 'TG910', origin: 'BKK', destination: 'HND', durationMs: 6 * 3600e3, staggerMin: 55 },
    { id: 'intl-17', flightNumber: 'CA981', origin: 'PEK', destination: 'JFK', durationMs: 14 * 3600e3, staggerMin: 170 },
    // India outbound long-haul
    { id: 'intl-18', flightNumber: 'AI101', origin: 'DEL', destination: 'JFK', durationMs: 16 * 3600e3, staggerMin: 10 },
    { id: 'intl-19', flightNumber: 'AI119', origin: 'BOM', destination: 'LHR', durationMs: 10 * 3600e3, staggerMin: 35 },
    { id: 'intl-20', flightNumber: 'UK7701', origin: 'DEL', destination: 'SFO', durationMs: 16 * 3600e3, staggerMin: 210 },
];

// Simulate current GPS location based on departure and arrival times
const interpolatePosition = (departureTime, arrivalTime, originCoords, destCoords) => {
    const now = new Date();
    const totalDuration = new Date(arrivalTime).getTime() - new Date(departureTime).getTime();
    const elapsed = now.getTime() - new Date(departureTime).getTime();

    if (elapsed <= 0) return originCoords;
    if (elapsed >= totalDuration) return destCoords;

    const progress = elapsed / totalDuration;
    const currentLat = originCoords.lat + (destCoords.lat - originCoords.lat) * progress;
    const currentLng = originCoords.lng + (destCoords.lng - originCoords.lng) * progress;
    return { lat: currentLat, lng: currentLng };
};

// For the simulated international flights we use a continuously looping clock
const getLoopingPosition = (route) => {
    const originCoords = airportCoordinates[route.origin];
    const destCoords = airportCoordinates[route.destination];
    if (!originCoords || !destCoords) return null;

    const staggerMs = route.staggerMin * 60 * 1000;
    // Progress loops between 0.0 → 1.0 endlessly based on current time
    const progress = ((Date.now() + staggerMs) % route.durationMs) / route.durationMs;

    const currentLat = originCoords.lat + (destCoords.lat - originCoords.lat) * progress;
    const currentLng = originCoords.lng + (destCoords.lng - originCoords.lng) * progress;

    const dy = destCoords.lat - originCoords.lat;
    const dx = Math.cos(Math.PI / 180 * originCoords.lat) * (destCoords.lng - originCoords.lng);
    const bearing = Math.atan2(dx, dy) * (180 / Math.PI);

    return {
        id: route.id,
        flightNumber: route.flightNumber,
        origin: route.origin,
        destination: route.destination,
        status: 'IN_FLIGHT',
        currentLocation: { lat: currentLat, lng: currentLng },
        bearing: bearing || 90,
    };
};

const calcBearing = (originCoords, destCoords) => {
    const dy = destCoords.lat - originCoords.lat;
    const dx = Math.cos(Math.PI / 180 * originCoords.lat) * (destCoords.lng - originCoords.lng);
    return Math.atan2(dx, dy) * (180 / Math.PI);
};

const startFleetTracker = (io) => {
    console.log('✈️  Starting Live Fleet Tracker simulation (domestic + international)...');

    setInterval(async () => {
        try {
            // ── 1. Real DB flights (Indian domestic + whatever is in the database) ──
            const flights = await prisma.flight.findMany({
                where: { status: { in: ['on-time', 'delayed'] } }
            });

            const dbPositions = flights.map(flight => {
                const originCoords = airportCoordinates[flight.origin] || airportCoordinates['DEL'];
                const destCoords = airportCoordinates[flight.destination] || airportCoordinates['BOM'];
                const currentLocation = interpolatePosition(flight.departureTime, flight.arrivalTime, originCoords, destCoords);
                const bearing = calcBearing(originCoords, destCoords);

                return {
                    id: flight.id,
                    flightNumber: flight.flightNumber,
                    origin: flight.origin,
                    destination: flight.destination,
                    status: flight.status === 'delayed' ? 'DELAYED' : 'IN_FLIGHT',
                    currentLocation,
                    bearing: bearing || 90,
                };
            });

            // ── 2. Simulated international flights (map-only, never in the DB) ──
            const intlPositions = INTL_ROUTES
                .map(getLoopingPosition)
                .filter(Boolean); // drop nulls if coords missing

            const allPositions = [...dbPositions, ...intlPositions];

            io.emit('fleet-positions', allPositions);

        } catch (error) {
            console.error('Error calculating fleet positions:', error);
        }
    }, 5000);
};

module.exports = { startFleetTracker };
