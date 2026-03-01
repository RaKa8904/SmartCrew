const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Clear existing data first (in safe order to avoid FK violations)
    await prisma.schedule.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.crew.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleared old data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ─── USERS ────────────────────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: { name: 'Global Admin', email: 'admin@airline.com', password: hashedPassword, role: 'admin' }
    });
    const scheduler = await prisma.user.create({
        data: { name: 'Operations Scheduler', email: 'scheduler@airline.com', password: hashedPassword, role: 'scheduler' }
    });

    // Pilots
    const u1 = await prisma.user.create({ data: { name: 'Capt. James Wilson', email: 'pilot1@airline.com', password: hashedPassword, role: 'crew' } });
    const u2 = await prisma.user.create({ data: { name: 'Capt. Priya Sharma', email: 'pilot2@airline.com', password: hashedPassword, role: 'crew' } });
    const u3 = await prisma.user.create({ data: { name: 'F/O. Marcus Lee', email: 'pilot3@airline.com', password: hashedPassword, role: 'crew' } });
    const u4 = await prisma.user.create({ data: { name: 'F/O. Aisha Rahman', email: 'pilot4@airline.com', password: hashedPassword, role: 'crew' } });

    // Cabin Crew
    const u5 = await prisma.user.create({ data: { name: 'Sarah Jenkins', email: 'cabin1@airline.com', password: hashedPassword, role: 'crew' } });
    const u6 = await prisma.user.create({ data: { name: 'David Okonkwo', email: 'cabin2@airline.com', password: hashedPassword, role: 'crew' } });
    const u7 = await prisma.user.create({ data: { name: 'Mei Lin', email: 'cabin3@airline.com', password: hashedPassword, role: 'crew' } });
    const u8 = await prisma.user.create({ data: { name: 'Carlos Mendes', email: 'cabin4@airline.com', password: hashedPassword, role: 'crew' } });
    const u9 = await prisma.user.create({ data: { name: 'Anya Petrova', email: 'cabin5@airline.com', password: hashedPassword, role: 'crew' } });
    const u10 = await prisma.user.create({ data: { name: 'Omar Hassan', email: 'cabin6@airline.com', password: hashedPassword, role: 'crew' } });

    console.log('Users created...');

    // ─── CREW DETAILS ─────────────────────────────────────────────────────────
    const c1 = await prisma.crew.create({ data: { userId: u1.id, crewType: 'pilot', qualification: 'A380 Captain', maxHoursPerWeek: 40 } });
    const c2 = await prisma.crew.create({ data: { userId: u2.id, crewType: 'pilot', qualification: 'B777 Captain', maxHoursPerWeek: 40 } });
    const c3 = await prisma.crew.create({ data: { userId: u3.id, crewType: 'pilot', qualification: 'A320 First Officer', maxHoursPerWeek: 45 } });
    const c4 = await prisma.crew.create({ data: { userId: u4.id, crewType: 'pilot', qualification: 'B737 First Officer', maxHoursPerWeek: 45 } });
    const c5 = await prisma.crew.create({ data: { userId: u5.id, crewType: 'cabin', qualification: 'Senior Purser', maxHoursPerWeek: 48 } });
    const c6 = await prisma.crew.create({ data: { userId: u6.id, crewType: 'cabin', qualification: 'Senior Purser', maxHoursPerWeek: 48 } });
    const c7 = await prisma.crew.create({ data: { userId: u7.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50 } });
    const c8 = await prisma.crew.create({ data: { userId: u8.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50 } });
    const c9 = await prisma.crew.create({ data: { userId: u9.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50 } });
    const c10 = await prisma.crew.create({ data: { userId: u10.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50 } });

    console.log('Crew profiles created...');

    // ─── FLIGHTS ──────────────────────────────────────────────────────────────
    // Dates relative to March 2026
    const flights = [
        { flightNumber: 'EK101', origin: 'DXB', destination: 'LHR', departureTime: new Date('2026-03-05T06:00:00Z'), arrivalTime: new Date('2026-03-05T13:00:00Z'), aircraftType: 'Airbus A380' },
        { flightNumber: 'EK102', origin: 'LHR', destination: 'DXB', departureTime: new Date('2026-03-05T15:00:00Z'), arrivalTime: new Date('2026-03-05T23:00:00Z'), aircraftType: 'Airbus A380' },
        { flightNumber: 'EK201', origin: 'DXB', destination: 'BOM', departureTime: new Date('2026-03-06T08:00:00Z'), arrivalTime: new Date('2026-03-06T11:00:00Z'), aircraftType: 'Boeing 777' },
        { flightNumber: 'EK202', origin: 'BOM', destination: 'DXB', departureTime: new Date('2026-03-06T13:00:00Z'), arrivalTime: new Date('2026-03-06T16:00:00Z'), aircraftType: 'Boeing 777' },
        { flightNumber: 'QR301', origin: 'DOH', destination: 'JFK', departureTime: new Date('2026-03-07T03:00:00Z'), arrivalTime: new Date('2026-03-07T12:00:00Z'), aircraftType: 'Boeing 777' },
        { flightNumber: 'QR302', origin: 'JFK', destination: 'DOH', departureTime: new Date('2026-03-07T15:00:00Z'), arrivalTime: new Date('2026-03-08T00:00:00Z'), aircraftType: 'Boeing 777' },
        { flightNumber: 'SQ401', origin: 'SIN', destination: 'SYD', departureTime: new Date('2026-03-08T10:00:00Z'), arrivalTime: new Date('2026-03-08T19:00:00Z'), aircraftType: 'Airbus A380' },
        { flightNumber: 'SQ402', origin: 'SYD', destination: 'SIN', departureTime: new Date('2026-03-09T08:00:00Z'), arrivalTime: new Date('2026-03-09T17:00:00Z'), aircraftType: 'Airbus A380' },
        { flightNumber: 'AI501', origin: 'DEL', destination: 'CDG', departureTime: new Date('2026-03-09T21:00:00Z'), arrivalTime: new Date('2026-03-10T05:00:00Z'), aircraftType: 'Airbus A320' },
        { flightNumber: 'BA601', origin: 'LHR', destination: 'ORD', departureTime: new Date('2026-03-10T09:00:00Z'), arrivalTime: new Date('2026-03-10T17:00:00Z'), aircraftType: 'Boeing 737' },
        { flightNumber: 'BA602', origin: 'ORD', destination: 'LHR', departureTime: new Date('2026-03-11T13:00:00Z'), arrivalTime: new Date('2026-03-12T03:00:00Z'), aircraftType: 'Boeing 737' },
        { flightNumber: 'EK303', origin: 'DXB', destination: 'SIN', departureTime: new Date('2026-03-12T01:00:00Z'), arrivalTime: new Date('2026-03-12T11:00:00Z'), aircraftType: 'Airbus A380' },
    ];

    const createdFlights = [];
    for (const f of flights) {
        const flight = await prisma.flight.create({ data: f });
        createdFlights.push(flight);
    }

    console.log('Flights created...');

    // ─── SCHEDULES (AI auto-assignment simulation) ────────────────────────────
    // Assign crew to first 8 flights (showing "already scheduled" scenarios)
    const scheduleAssignments = [
        // EK101: Capt. Wilson (pilot) + Sarah Jenkins (cabin)
        { flightId: createdFlights[0].id, crewId: c1.id, assignedById: admin.id },
        { flightId: createdFlights[0].id, crewId: c5.id, assignedById: admin.id },
        { flightId: createdFlights[0].id, crewId: c7.id, assignedById: admin.id },
        // EK102: Capt. Sharma (pilot) + David Okonkwo (cabin)
        { flightId: createdFlights[1].id, crewId: c2.id, assignedById: admin.id },
        { flightId: createdFlights[1].id, crewId: c6.id, assignedById: admin.id },
        { flightId: createdFlights[1].id, crewId: c8.id, assignedById: admin.id },
        // EK201: F/O. Marcus Lee (pilot) + Mei Lin (cabin)
        { flightId: createdFlights[2].id, crewId: c3.id, assignedById: admin.id },
        { flightId: createdFlights[2].id, crewId: c7.id, assignedById: admin.id },
        // EK202: F/O. Aisha Rahman + Carlos Mendes
        { flightId: createdFlights[3].id, crewId: c4.id, assignedById: admin.id },
        { flightId: createdFlights[3].id, crewId: c8.id, assignedById: admin.id },
        // QR301: Capt. Wilson + Anya Petrova + Omar Hassan
        { flightId: createdFlights[4].id, crewId: c1.id, assignedById: admin.id },
        { flightId: createdFlights[4].id, crewId: c9.id, assignedById: admin.id },
        { flightId: createdFlights[4].id, crewId: c10.id, assignedById: admin.id },
        // QR302: Capt. Sharma
        { flightId: createdFlights[5].id, crewId: c2.id, assignedById: admin.id },
        { flightId: createdFlights[5].id, crewId: c5.id, assignedById: admin.id },
        // SQ401: F/O. Marcus Lee + Sarah Jenkins
        { flightId: createdFlights[6].id, crewId: c3.id, assignedById: admin.id },
        { flightId: createdFlights[6].id, crewId: c5.id, assignedById: admin.id },
        // SQ402: F/O. Aisha Rahman
        { flightId: createdFlights[7].id, crewId: c4.id, assignedById: admin.id },
        { flightId: createdFlights[7].id, crewId: c6.id, assignedById: admin.id },
        // Remaining 4 flights (AI501, BA601, BA602, EK303) left UNSCHEDULED
        // so the scheduler can demo the Auto-Generate feature
    ];

    for (const s of scheduleAssignments) {
        await prisma.schedule.create({ data: s });
    }

    console.log('Schedules assigned...');

    // ─── AVAILABILITY ─────────────────────────────────────────────────────────
    const today = new Date('2026-03-02');
    const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

    const availabilityData = [
        // Capt. Wilson: available most days
        { crewId: c1.id, availableDate: addDays(today, 0), status: 'available' },
        { crewId: c1.id, availableDate: addDays(today, 1), status: 'available' },
        { crewId: c1.id, availableDate: addDays(today, 2), status: 'off' },
        { crewId: c1.id, availableDate: addDays(today, 3), status: 'available' },
        { crewId: c1.id, availableDate: addDays(today, 4), status: 'available' },
        // Capt. Sharma: off first 2 days
        { crewId: c2.id, availableDate: addDays(today, 0), status: 'off' },
        { crewId: c2.id, availableDate: addDays(today, 1), status: 'off' },
        { crewId: c2.id, availableDate: addDays(today, 2), status: 'available' },
        { crewId: c2.id, availableDate: addDays(today, 3), status: 'available' },
        { crewId: c2.id, availableDate: addDays(today, 4), status: 'available' },
        // F/O Marcus Lee
        { crewId: c3.id, availableDate: addDays(today, 0), status: 'available' },
        { crewId: c3.id, availableDate: addDays(today, 1), status: 'available' },
        { crewId: c3.id, availableDate: addDays(today, 2), status: 'available' },
        { crewId: c3.id, availableDate: addDays(today, 3), status: 'off' },
        // F/O Aisha Rahman
        { crewId: c4.id, availableDate: addDays(today, 0), status: 'available' },
        { crewId: c4.id, availableDate: addDays(today, 1), status: 'available' },
        { crewId: c4.id, availableDate: addDays(today, 2), status: 'available' },
        // Sarah Jenkins (cabin)
        { crewId: c5.id, availableDate: addDays(today, 0), status: 'available' },
        { crewId: c5.id, availableDate: addDays(today, 1), status: 'available' },
        { crewId: c5.id, availableDate: addDays(today, 2), status: 'off' },
        { crewId: c5.id, availableDate: addDays(today, 4), status: 'available' },
        // David Okonkwo
        { crewId: c6.id, availableDate: addDays(today, 0), status: 'off' },
        { crewId: c6.id, availableDate: addDays(today, 1), status: 'available' },
        { crewId: c6.id, availableDate: addDays(today, 2), status: 'available' },
        { crewId: c6.id, availableDate: addDays(today, 3), status: 'available' },
    ];

    for (const a of availabilityData) {
        await prisma.availability.create({ data: a });
    }

    console.log('Availability data seeded...');
    console.log('\n✅ Database fully seeded with rich dummy data!');
    console.log('\n📋 Summary:');
    console.log('  - 12 Users (1 Admin, 1 Scheduler, 4 Pilots, 6 Cabin Crew)');
    console.log('  - 12 Flights (8 scheduled, 4 pending AI assignment)');
    console.log('  - 19 Schedule assignments');
    console.log('  - 24 Availability records');
    console.log('\n🔑 Login credentials (all use password: password123):');
    console.log('  Admin:     admin@airline.com');
    console.log('  Scheduler: scheduler@airline.com');
    console.log('  Pilot:     pilot1@airline.com / pilot2@airline.com / pilot3@airline.com / pilot4@airline.com');
    console.log('  Cabin:     cabin1@airline.com through cabin6@airline.com');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
