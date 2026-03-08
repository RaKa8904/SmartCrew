const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const airportCoordinates = require('../utils/airportCoordinates');

// Simulate current GPS location based on flight departure and arrival times
const interpolatePosition = (departureTime, arrivalTime, originCoords, destCoords) => {
    const now = new Date();
    const totalDuration = new Date(arrivalTime).getTime() - new Date(departureTime).getTime();
    const elapsed = now.getTime() - new Date(departureTime).getTime();

    // If flight hasn't started, return origin
    if (elapsed <= 0) return originCoords;

    // If flight has landed, return destination
    if (elapsed >= totalDuration) return destCoords;

    const progress = elapsed / totalDuration; // Value between 0.0 and 1.0

    // Linear interpolation for lat and lng
    const currentLat = originCoords.lat + (destCoords.lat - originCoords.lat) * progress;
    const currentLng = originCoords.lng + (destCoords.lng - originCoords.lng) * progress;

    return { lat: currentLat, lng: currentLng };
};

const startFleetTracker = (io) => {
    console.log('✈️  Starting Live Fleet Tracker simulation...');

    // Emit updated flight positions every 5 seconds
    setInterval(async () => {
        try {
            // Fetch flights that can be shown on the map
            const flights = await prisma.flight.findMany({
                where: {
                    status: {
                        in: ['on-time', 'delayed']
                    }
                }
            });

            console.log(`[Tracker] Fetched ${flights.length} eligible flights from DB`);

            const livePositions = flights.map(flight => {
                const originCoords = airportCoordinates[flight.origin] || airportCoordinates['JFK']; // Default to JFK if not found
                const destCoords = airportCoordinates[flight.destination] || airportCoordinates['LHR']; // Default to LHR

                const currentLocation = interpolatePosition(flight.departureTime, flight.arrivalTime, originCoords, destCoords);

                // Calculate bearing/rotation angle so the airplane icon points in the right direction
                const dy = destCoords.lat - originCoords.lat;
                const dx = Math.cos(Math.PI / 180 * originCoords.lat) * (destCoords.lng - originCoords.lng);
                const angle = Math.atan2(dx, dy) * (180 / Math.PI); // In degrees from North

                return {
                    id: flight.id,
                    flightNumber: flight.flightNumber,
                    origin: flight.origin,
                    destination: flight.destination,
                    status: flight.status === 'delayed' ? 'DELAYED' : 'IN_FLIGHT', // Map to UI friendly
                    currentLocation,
                    bearing: angle || 90
                };
            });

            // Broadcast the positions to all connected Admins viewing the dashboard
            io.emit('fleet-positions', livePositions);

        } catch (error) {
            console.error('Error calculating fleet positions:', error);
        }
    }, 5000); // 5 seconds
};

module.exports = { startFleetTracker };
