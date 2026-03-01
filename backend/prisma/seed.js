const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@airline.com' },
        update: {},
        create: {
            name: 'Global Admin',
            email: 'admin@airline.com',
            password: hashedPassword,
            role: 'admin',
        },
    });

    const scheduler = await prisma.user.upsert({
        where: { email: 'scheduler@airline.com' },
        update: {},
        create: {
            name: 'Operations Scheduler',
            email: 'scheduler@airline.com',
            password: hashedPassword,
            role: 'scheduler',
        },
    });

    const crew1 = await prisma.user.upsert({
        where: { email: 'pilot1@airline.com' },
        update: {},
        create: {
            name: 'Capt. James Wilson',
            email: 'pilot1@airline.com',
            password: hashedPassword,
            role: 'crew',
        },
    });

    const crew2 = await prisma.user.upsert({
        where: { email: 'cabin1@airline.com' },
        update: {},
        create: {
            name: 'Sarah Jenkins',
            email: 'cabin1@airline.com',
            password: hashedPassword,
            role: 'crew',
        },
    });

    // 2. Create Crew details
    await prisma.crew.upsert({
        where: { userId: crew1.id },
        update: {},
        create: {
            userId: crew1.id,
            crewType: 'pilot',
            qualification: 'A320 Captain',
            maxHoursPerWeek: 40,
        },
    });

    await prisma.crew.upsert({
        where: { userId: crew2.id },
        update: {},
        create: {
            userId: crew2.id,
            crewType: 'cabin',
            qualification: 'Senior Purser',
            maxHoursPerWeek: 45,
        },
    });

    // 3. Create initial flights
    const flights = [
        { flightNumber: 'EK202', origin: 'DXB', destination: 'LHR', departureTime: new Date('2026-03-05T08:00:00Z'), arrivalTime: new Date('2026-03-05T15:00:00Z'), aircraftType: 'Airbus A380' },
        { flightNumber: 'EK203', origin: 'LHR', destination: 'DXB', departureTime: new Date('2026-03-06T10:00:00Z'), arrivalTime: new Date('2026-03-06T17:00:00Z'), aircraftType: 'Airbus A380' },
        { flightNumber: 'QR101', origin: 'DOH', destination: 'JFK', departureTime: new Date('2026-03-07T05:00:00Z'), arrivalTime: new Date('2026-03-07T14:40:00Z'), aircraftType: 'Boeing 777' },
    ];

    for (const f of flights) {
        await prisma.flight.upsert({
            where: { flightNumber: f.flightNumber },
            update: {},
            create: f,
        });
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
