const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { generateSchedule } = require('./schedulingService');

const prisma = new PrismaClient();

const generateRealisticIndianFlights = () => {
    // Domestic airlines
    const domesticAirlines = [
        { name: 'IndiGo', code: '6E', types: ['Airbus A320', 'Airbus A321'] },
        { name: 'Air India', code: 'AI', types: ['Boeing 777', 'Airbus A350', 'Airbus A320'] },
        { name: 'Vistara', code: 'UK', types: ['Airbus A320neo', 'Boeing 787'] },
        { name: 'SpiceJet', code: 'SG', types: ['Boeing 737'] }
    ];
    // International airlines
    const internationalAirlines = [
        { name: 'British Airways', code: 'BA', types: ['Boeing 777', 'Boeing 787'] },
        { name: 'Emirates', code: 'EK', types: ['Airbus A380', 'Boeing 777'] },
        { name: 'Singapore Airlines', code: 'SQ', types: ['Airbus A350', 'Airbus A380'] },
        { name: 'Lufthansa', code: 'LH', types: ['Boeing 747', 'Airbus A350'] },
        { name: 'United Airlines', code: 'UA', types: ['Boeing 787', 'Boeing 777'] },
        { name: 'Qatar Airways', code: 'QR', types: ['Boeing 777', 'Airbus A350'] }
    ];

    // Primary hubs we support departing from / arriving at
    const HUBS = ['DEL', 'BOM'];

    // Domestic destinations (excluding the current hub)
    const domesticDestinations = ['BLR', 'HYD', 'MAA', 'CCU', 'GOI'];

    // International destinations with realistic durations from India
    const internationalDestinations = [
        { iata: 'JFK', dur: 14.5 },
        { iata: 'LHR', dur: 9.0 },
        { iata: 'SIN', dur: 5.5 },
        { iata: 'DXB', dur: 3.5 },
        { iata: 'CDG', dur: 8.5 },
        { iata: 'HND', dur: 7.5 }
    ];

    const flights = [];
    const usedFlightNumbers = new Set();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1); // start tomorrow

    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
        const currentDate = new Date(today.getTime() + dayOffset * 86400000);

        // Generate 20 flights per day across hubs and directions
        for (let i = 0; i < 20; i++) {
            const hub = HUBS[Math.floor(Math.random() * HUBS.length)];
            const isDeparture = Math.random() > 0.5; // True = departing from hub, False = arriving at hub
            const isInternational = Math.random() > 0.4; // 40% domestic, 60% international

            let origin, destination, duration;
            let airline, aircraftType;

            if (isInternational) {
                airline = internationalAirlines[Math.floor(Math.random() * internationalAirlines.length)];
                const intlDest = internationalDestinations[Math.floor(Math.random() * internationalDestinations.length)];
                duration = intlDest.dur;

                if (isDeparture) {
                    origin = hub;
                    destination = intlDest.iata;
                } else {
                    origin = intlDest.iata;
                    destination = hub;
                }
                aircraftType = airline.types[Math.floor(Math.random() * airline.types.length)];
            } else {
                airline = domesticAirlines[Math.floor(Math.random() * domesticAirlines.length)];
                duration = 1.5 + Math.random() * 1.5; // 1.5 to 3.0 hrs
                
                // Select other domestic airport
                const otherDomestic = [...domesticDestinations, ...HUBS.filter(h => h !== hub)];
                const randomDest = otherDomestic[Math.floor(Math.random() * otherDomestic.length)];

                if (isDeparture) {
                    origin = hub;
                    destination = randomDest;
                } else {
                    origin = randomDest;
                    destination = hub;
                }
                aircraftType = airline.types[Math.floor(Math.random() * airline.types.length)];
            }

            // Double check: safety guarantee
            if (origin === destination) {
                destination = origin === 'DEL' ? 'BOM' : 'DEL';
            }

            // Generate a unique flight number
            let flightNumber;
            let attempts = 0;
            do {
                flightNumber = `${airline.code}${Math.floor(Math.random() * 900) + 100}`;
                attempts++;
            } while (usedFlightNumbers.has(flightNumber) && attempts < 50);
            if (usedFlightNumbers.has(flightNumber)) continue;
            usedFlightNumbers.add(flightNumber);

            // Random departure time between 05:00 and 22:00
            const hour = Math.floor(Math.random() * 17) + 5;
            const minute = Math.floor(Math.random() * 60);

            const depTime = new Date(currentDate);
            depTime.setUTCHours(hour, minute, 0, 0);

            const arrTime = new Date(depTime.getTime() + duration * 3600000);
            const statusOptions = ['on-time', 'on-time', 'on-time', 'on-time', 'delayed'];

            flights.push({
                flightNumber,
                origin,
                destination,
                departureTime: depTime,
                arrivalTime: arrTime,
                aircraftType,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
                gate: `${['T1', 'T2', 'T3'][Math.floor(Math.random() * 3)]}-${Math.floor(Math.random() * 60) + 1}`,
                terminal: 'Terminal 3'
            });
        }
    }
    return flights;
};

const syncLiveFlights = async () => {
    try {
        const apiKey = process.env.AVIATIONSTACK_API_KEY;
        let flightsData = [];

        if (!apiKey) {
            console.warn('⚠️ No AVIATIONSTACK_API_KEY found. Falling back to high-volume realistic mock Indian Domestic Flights.');
            flightsData = generateRealisticIndianFlights();
        } else {
            console.log('🌐 Fetching live flights from Aviationstack DEL hub...');
            const res = await axios.get(`http://api.aviationstack.com/v1/flights`, {
                params: {
                    access_key: apiKey,
                    dep_iata: 'DEL',
                    flight_status: 'scheduled',
                    limit: 60
                }
            });

            if (res.data && res.data.data) {
                flightsData = res.data.data.map(apiFlight => {
                    return {
                        flightNumber: apiFlight.flight.iata || apiFlight.flight.icao || 'UNK',
                        origin: 'DEL',
                        destination: apiFlight.arrival.iata || 'UNK',
                        departureTime: new Date(apiFlight.departure.scheduled),
                        arrivalTime: new Date(apiFlight.arrival.scheduled),
                        aircraftType: apiFlight.aircraft?.iata || 'Boeing 737', // Fallback if missing
                        status: apiFlight.flight_status === 'scheduled' ? 'on-time' : apiFlight.flight_status,
                        gate: apiFlight.departure.gate || 'TBD',
                        terminal: apiFlight.departure.terminal || 'T3'
                    };
                }).filter(f => f.destination !== 'UNK' && f.flightNumber !== 'UNK');
            }
        }

        console.log(`Processing ${flightsData.length} flights for injection...`);

        // First, explicitly wipe all schedules (and their cascading dependencies) to safely wipe flights
        await prisma.shiftBid.deleteMany();
        await prisma.shiftSwapRequest.deleteMany();
        await prisma.schedule.deleteMany();
        await prisma.flight.deleteMany();
        console.log('🧹 Cleared old flights and schedules to prepare for real-world sync.');

        const createdFlights = [];
        for (const f of flightsData) {
            const flight = await prisma.flight.upsert({
                where: { flightNumber: f.flightNumber },
                update: f,
                create: f,
            });
            createdFlights.push(flight);
        }

        console.log(`✅ Successfully synced ${createdFlights.length} flights into the database.`);

        // TRIGGER AI SCHEDULING ENGINE
        console.log('🤖 Triggering SmartCrew AI Scoring Engine to staff the new flights...');
        const scheduleResult = await generateSchedule();
        console.log(`✅ AI Staffing Complete: ${scheduleResult.assignmentsMade} assignments made.`);

        return {
            message: 'Sync and AI Staffing complete',
            count: createdFlights.length,
            flights: createdFlights,
            scheduling: scheduleResult
        };
    } catch (error) {
        console.error('Failed to sync live flights:', error);
        throw error;
    }
};

module.exports = { syncLiveFlights };
