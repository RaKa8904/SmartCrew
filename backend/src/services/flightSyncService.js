const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { generateSchedule } = require('./schedulingService');

const prisma = new PrismaClient();

const generateRealisticIndianFlights = () => {
    const airlines = [
        { name: 'IndiGo', code: '6E', types: ['Airbus A320', 'Airbus A321'] },
        { name: 'Air India', code: 'AI', types: ['Boeing 777', 'Airbus A350', 'Airbus A320'] },
        { name: 'Vistara', code: 'UK', types: ['Airbus A320neo', 'Boeing 787'] },
        { name: 'SpiceJet', code: 'SG', types: ['Boeing 737'] }
    ];
    const destinations = [
        { iata: 'BOM', dur: 2.2 }, // Mumbai
        { iata: 'BLR', dur: 2.7 }, // Bangalore
        { iata: 'HYD', dur: 2.1 }, // Hyderabad
        { iata: 'MAA', dur: 2.8 }, // Chennai
        { iata: 'CCU', dur: 2.3 }, // Kolkata
        { iata: 'GOI', dur: 2.5 }, // Goa
    ];

    const flights = [];
    const usedFlightNumbers = new Set();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1); // start tomorrow

    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
        const currentDate = new Date(today.getTime() + dayOffset * 86400000);

        // Generate 15 flights per day from DEL
        for (let i = 0; i < 15; i++) {
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const dest = destinations[Math.floor(Math.random() * destinations.length)];

            // Generate a unique flight number to avoid P2002 constraint violations
            let flightNumber;
            let attempts = 0;
            do {
                flightNumber = `${airline.code}${Math.floor(Math.random() * 900) + 100}`;
                attempts++;
            } while (usedFlightNumbers.has(flightNumber) && attempts < 50);
            if (usedFlightNumbers.has(flightNumber)) continue; // skip if truly stuck
            usedFlightNumbers.add(flightNumber);

            // Random departure time between 05:00 and 22:00
            const hour = Math.floor(Math.random() * 17) + 5;
            const minute = Math.floor(Math.random() * 60);

            const depTime = new Date(currentDate);
            depTime.setUTCHours(hour, minute, 0, 0);

            const arrTime = new Date(depTime.getTime() + dest.dur * 3600000);
            const statusOptions = ['on-time', 'on-time', 'on-time', 'on-time', 'delayed'];

            flights.push({
                flightNumber,
                origin: 'DEL',
                destination: dest.iata,
                departureTime: depTime,
                arrivalTime: arrTime,
                aircraftType: airline.types[Math.floor(Math.random() * airline.types.length)],
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
