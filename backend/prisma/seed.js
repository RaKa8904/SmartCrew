const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Clear existing data in safe order to avoid FK violations
    await prisma.notification.deleteMany();
    await prisma.shiftSwapRequest.deleteMany(); // Clear new dependencies
    await prisma.leaveRequest.deleteMany();
    await prisma.shiftBid.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.crew.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rule.deleteMany();
    await prisma.report.deleteMany();

    console.log('🗑️  Cleared old data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ─── USERS ────────────────────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: { name: 'Global Admin', email: 'admin@airline.com', password: hashedPassword, role: 'admin' }
    });
    const scheduler = await prisma.user.create({
        data: { name: 'Operations Scheduler', email: 'scheduler@airline.com', password: hashedPassword, role: 'scheduler' }
    });
    const scheduler2 = await prisma.user.create({
        data: { name: 'Dispatch Officer', email: 'dispatch@airline.com', password: hashedPassword, role: 'scheduler' }
    });

    // Pilots
    const u1 = await prisma.user.create({ data: { name: 'Capt. James Wilson', email: 'pilot1@airline.com', password: hashedPassword, role: 'crew' } });
    const u2 = await prisma.user.create({ data: { name: 'Capt. Priya Sharma', email: 'pilot2@airline.com', password: hashedPassword, role: 'crew' } });
    const u3 = await prisma.user.create({ data: { name: 'F/O Marcus Lee', email: 'pilot3@airline.com', password: hashedPassword, role: 'crew' } });
    const u4 = await prisma.user.create({ data: { name: 'F/O Aisha Rahman', email: 'pilot4@airline.com', password: hashedPassword, role: 'crew' } });
    const u5 = await prisma.user.create({ data: { name: 'Capt. Thomas Erikson', email: 'pilot5@airline.com', password: hashedPassword, role: 'crew' } });

    // Cabin Crew
    const u6 = await prisma.user.create({ data: { name: 'Sarah Jenkins', email: 'cabin1@airline.com', password: hashedPassword, role: 'crew' } });
    const u7 = await prisma.user.create({ data: { name: 'David Okonkwo', email: 'cabin2@airline.com', password: hashedPassword, role: 'crew' } });
    const u8 = await prisma.user.create({ data: { name: 'Mei Lin', email: 'cabin3@airline.com', password: hashedPassword, role: 'crew' } });
    const u9 = await prisma.user.create({ data: { name: 'Carlos Mendes', email: 'cabin4@airline.com', password: hashedPassword, role: 'crew' } });
    const u10 = await prisma.user.create({ data: { name: 'Anya Petrova', email: 'cabin5@airline.com', password: hashedPassword, role: 'crew' } });
    const u11 = await prisma.user.create({ data: { name: 'Omar Hassan', email: 'cabin6@airline.com', password: hashedPassword, role: 'crew' } });
    const u12 = await prisma.user.create({ data: { name: 'Yuki Tanaka', email: 'cabin7@airline.com', password: hashedPassword, role: 'crew' } });
    const u13 = await prisma.user.create({ data: { name: 'Elena Vasquez', email: 'cabin8@airline.com', password: hashedPassword, role: 'crew' } });

    console.log('✅ Users created (3 staff + 5 pilots + 8 cabin crew)...');

    // ─── CREW DETAILS ─────────────────────────────────────────────────────────
    const c1 = await prisma.crew.create({ data: { userId: u1.id, crewType: 'pilot', qualification: 'A380 Type Rated Captain', maxHoursPerWeek: 40, status: 'active' } });
    const c2 = await prisma.crew.create({ data: { userId: u2.id, crewType: 'pilot', qualification: 'B777 Type Rated Captain', maxHoursPerWeek: 40, status: 'active' } });
    const c3 = await prisma.crew.create({ data: { userId: u3.id, crewType: 'pilot', qualification: 'A320 First Officer', maxHoursPerWeek: 45, status: 'active' } });
    const c4 = await prisma.crew.create({ data: { userId: u4.id, crewType: 'pilot', qualification: 'B737 First Officer', maxHoursPerWeek: 45, status: 'active' } });
    const c5 = await prisma.crew.create({ data: { userId: u5.id, crewType: 'pilot', qualification: 'B787 Type Rated Captain', maxHoursPerWeek: 40, status: 'active' } });
    const c6 = await prisma.crew.create({ data: { userId: u6.id, crewType: 'cabin', qualification: 'Senior Purser', maxHoursPerWeek: 48, status: 'active' } });
    const c7 = await prisma.crew.create({ data: { userId: u7.id, crewType: 'cabin', qualification: 'Senior Purser', maxHoursPerWeek: 48, status: 'active' } });
    const c8 = await prisma.crew.create({ data: { userId: u8.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50, status: 'active' } });
    const c9 = await prisma.crew.create({ data: { userId: u9.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50, status: 'active' } });
    const c10 = await prisma.crew.create({ data: { userId: u10.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50, status: 'active' } });
    const c11 = await prisma.crew.create({ data: { userId: u11.id, crewType: 'cabin', qualification: 'Flight Attendant', maxHoursPerWeek: 50, status: 'active' } });
    const c12 = await prisma.crew.create({ data: { userId: u12.id, crewType: 'cabin', qualification: 'Cabin Crew Junior', maxHoursPerWeek: 50, status: 'active' } });
    const c13 = await prisma.crew.create({ data: { userId: u13.id, crewType: 'cabin', qualification: 'Cabin Crew Junior', maxHoursPerWeek: 50, status: 'on-leave' } });

    console.log('✅ Crew profiles created...');

    // ─── FLIGHTS ──────────────────────────────────────────────────────────────
    const flights = [
        // ── Week 1: March 5–7 ──
        { flightNumber: 'EK101', origin: 'DXB', destination: 'LHR', departureTime: new Date('2026-03-05T06:00:00Z'), arrivalTime: new Date('2026-03-05T13:00:00Z'), aircraftType: 'Airbus A380', status: 'on-time', gate: 'A14', terminal: 'Terminal 3' },
        { flightNumber: 'EK102', origin: 'LHR', destination: 'DXB', departureTime: new Date('2026-03-05T15:00:00Z'), arrivalTime: new Date('2026-03-05T23:00:00Z'), aircraftType: 'Airbus A380', status: 'delayed', gate: 'B22', terminal: 'Terminal 5' },
        { flightNumber: 'EK201', origin: 'DXB', destination: 'BOM', departureTime: new Date('2026-03-06T08:00:00Z'), arrivalTime: new Date('2026-03-06T11:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'C8', terminal: 'Terminal 1' },
        { flightNumber: 'EK202', origin: 'BOM', destination: 'DXB', departureTime: new Date('2026-03-06T13:00:00Z'), arrivalTime: new Date('2026-03-06T16:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'D5', terminal: 'CSIA T2' },
        { flightNumber: 'QR301', origin: 'DOH', destination: 'JFK', departureTime: new Date('2026-03-06T03:00:00Z'), arrivalTime: new Date('2026-03-06T12:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'E31', terminal: 'Terminal 4' },
        { flightNumber: 'QR302', origin: 'JFK', destination: 'DOH', departureTime: new Date('2026-03-07T15:00:00Z'), arrivalTime: new Date('2026-03-08T00:00:00Z'), aircraftType: 'Boeing 777', status: 'delayed', gate: 'F12', terminal: 'JFK T4' },

        // ── Week 1: March 8–10 ──
        { flightNumber: 'SQ401', origin: 'SIN', destination: 'SYD', departureTime: new Date('2026-03-08T10:00:00Z'), arrivalTime: new Date('2026-03-08T19:00:00Z'), aircraftType: 'Airbus A380', status: 'on-time', gate: 'G21', terminal: 'Terminal 3' },
        { flightNumber: 'SQ402', origin: 'SYD', destination: 'SIN', departureTime: new Date('2026-03-09T08:00:00Z'), arrivalTime: new Date('2026-03-09T17:00:00Z'), aircraftType: 'Airbus A380', status: 'cancelled', gate: 'H4', terminal: 'T1 International' },
        { flightNumber: 'AI501', origin: 'DEL', destination: 'CDG', departureTime: new Date('2026-03-09T21:00:00Z'), arrivalTime: new Date('2026-03-10T05:00:00Z'), aircraftType: 'Boeing 787', status: 'on-time', gate: 'K7', terminal: 'IGIA T3' },
        { flightNumber: 'BA601', origin: 'LHR', destination: 'ORD', departureTime: new Date('2026-03-10T09:00:00Z'), arrivalTime: new Date('2026-03-10T17:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'L16', terminal: 'Terminal 5' },
        { flightNumber: 'BA602', origin: 'ORD', destination: 'LHR', departureTime: new Date('2026-03-11T13:00:00Z'), arrivalTime: new Date('2026-03-12T03:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'M3', terminal: 'ORD T5' },
        { flightNumber: 'EK303', origin: 'DXB', destination: 'SIN', departureTime: new Date('2026-03-12T01:00:00Z'), arrivalTime: new Date('2026-03-12T11:00:00Z'), aircraftType: 'Airbus A380', status: 'on-time', gate: 'A9', terminal: 'Terminal 3' },

        // ── Week 2: March 13–16 ──
        { flightNumber: 'AF701', origin: 'CDG', destination: 'NRT', departureTime: new Date('2026-03-13T10:30:00Z'), arrivalTime: new Date('2026-03-14T05:30:00Z'), aircraftType: 'Airbus A380', status: 'on-time', gate: 'N20', terminal: '2E' },
        { flightNumber: 'LH801', origin: 'FRA', destination: 'LAX', departureTime: new Date('2026-03-13T13:00:00Z'), arrivalTime: new Date('2026-03-13T23:00:00Z'), aircraftType: 'Airbus A340', status: 'on-time', gate: 'P6', terminal: 'Terminal A' },
        { flightNumber: 'TK901', origin: 'IST', destination: 'JFK', departureTime: new Date('2026-03-14T02:00:00Z'), arrivalTime: new Date('2026-03-14T11:00:00Z'), aircraftType: 'Boeing 777', status: 'delayed', gate: 'Q15', terminal: 'IST International' },
        { flightNumber: 'CX1001', origin: 'HKG', destination: 'LHR', departureTime: new Date('2026-03-14T23:30:00Z'), arrivalTime: new Date('2026-03-15T06:30:00Z'), aircraftType: 'Airbus A350', status: 'on-time', gate: 'R8', terminal: 'T1' },
        { flightNumber: 'EY1101', origin: 'AUH', destination: 'MEL', departureTime: new Date('2026-03-15T08:15:00Z'), arrivalTime: new Date('2026-03-15T23:15:00Z'), aircraftType: 'Airbus A380', status: 'on-time', gate: 'S11', terminal: 'Terminal 3' },
        { flightNumber: 'UA1201', origin: 'SFO', destination: 'NRT', departureTime: new Date('2026-03-15T11:00:00Z'), arrivalTime: new Date('2026-03-16T14:00:00Z'), aircraftType: 'Boeing 787', status: 'on-time', gate: 'T4', terminal: 'SFO T3' },

        // ── Week 2: March 17–20 ──
        { flightNumber: 'MH1301', origin: 'KUL', destination: 'LHR', departureTime: new Date('2026-03-17T00:30:00Z'), arrivalTime: new Date('2026-03-17T07:00:00Z'), aircraftType: 'Airbus A350', status: 'on-time', gate: 'U9', terminal: 'KLIA' },
        { flightNumber: 'EK404', origin: 'DXB', destination: 'JFK', departureTime: new Date('2026-03-17T08:30:00Z'), arrivalTime: new Date('2026-03-17T17:30:00Z'), aircraftType: 'Airbus A380', status: 'cancelled', gate: 'A22', terminal: 'Terminal 3' },
        { flightNumber: 'AA1401', origin: 'DFW', destination: 'LHR', departureTime: new Date('2026-03-18T16:00:00Z'), arrivalTime: new Date('2026-03-19T07:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'V14', terminal: 'DFW T0' },
        { flightNumber: 'SQ501', origin: 'SIN', destination: 'ZRH', departureTime: new Date('2026-03-19T23:50:00Z'), arrivalTime: new Date('2026-03-20T06:00:00Z'), aircraftType: 'Airbus A350', status: 'on-time', gate: 'W3', terminal: 'Terminal 3' },
        { flightNumber: 'NH1501', origin: 'NRT', destination: 'LAX', departureTime: new Date('2026-03-20T10:30:00Z'), arrivalTime: new Date('2026-03-20T23:00:00Z'), aircraftType: 'Boeing 787', status: 'on-time', gate: 'X12', terminal: 'Terminal 2' },
        { flightNumber: 'EK550', origin: 'DXB', destination: 'CDG', departureTime: new Date('2026-03-21T06:00:00Z'), arrivalTime: new Date('2026-03-21T11:00:00Z'), aircraftType: 'Boeing 777', status: 'on-time', gate: 'A18', terminal: 'Terminal 3' },
        { flightNumber: 'WB1601', origin: 'KGL', destination: 'AMS', departureTime: new Date('2026-03-22T04:00:00Z'), arrivalTime: new Date('2026-03-22T13:30:00Z'), aircraftType: 'Airbus A330', status: 'on-time', gate: 'Y7', terminal: 'KGL Intl' },
    ];

    const createdFlights = [];
    for (const f of flights) {
        const flight = await prisma.flight.create({ data: f });
        createdFlights.push(flight);
    }

    console.log(`✅ ${createdFlights.length} flights created...`);

    // ─── SCHEDULES ────────────────────────────────────────────────────────────
    // Assign crew to flights 0–18 (leaving last 6 unscheduled for demo)
    const scheduleAssignments = [
        // EK101 (DXB→LHR): Capt. Wilson + Sarah Jenkins + Mei Lin + Yuki
        { flightId: createdFlights[0].id, crewId: c1.id, assignedById: admin.id },
        { flightId: createdFlights[0].id, crewId: c6.id, assignedById: admin.id },
        { flightId: createdFlights[0].id, crewId: c8.id, assignedById: admin.id },
        { flightId: createdFlights[0].id, crewId: c12.id, assignedById: admin.id },

        // EK102 (LHR→DXB): Capt. Sharma + David + Carlos
        { flightId: createdFlights[1].id, crewId: c2.id, assignedById: admin.id },
        { flightId: createdFlights[1].id, crewId: c7.id, assignedById: admin.id },
        { flightId: createdFlights[1].id, crewId: c9.id, assignedById: admin.id },

        // EK201 (DXB→BOM): F/O Marcus + Anya Petrova
        { flightId: createdFlights[2].id, crewId: c3.id, assignedById: admin.id },
        { flightId: createdFlights[2].id, crewId: c10.id, assignedById: admin.id },

        // EK202 (BOM→DXB): F/O Aisha + Carlos
        { flightId: createdFlights[3].id, crewId: c4.id, assignedById: admin.id },
        { flightId: createdFlights[3].id, crewId: c9.id, assignedById: admin.id },

        // QR301 (DOH→JFK): Capt. Erikson + Omar Hassan + Mei
        { flightId: createdFlights[4].id, crewId: c5.id, assignedById: admin.id },
        { flightId: createdFlights[4].id, crewId: c11.id, assignedById: scheduler.id },
        { flightId: createdFlights[4].id, crewId: c8.id, assignedById: scheduler.id },

        // QR302 (JFK→DOH): Capt. Wilson + Sarah Jenkins
        { flightId: createdFlights[5].id, crewId: c1.id, assignedById: admin.id },
        { flightId: createdFlights[5].id, crewId: c6.id, assignedById: admin.id },

        // SQ401 (SIN→SYD): Capt. Sharma + David + Anya
        { flightId: createdFlights[6].id, crewId: c2.id, assignedById: scheduler.id },
        { flightId: createdFlights[6].id, crewId: c7.id, assignedById: scheduler.id },
        { flightId: createdFlights[6].id, crewId: c10.id, assignedById: scheduler.id },

        // SQ402 (SYD→SIN, CANCELLED): F/O Marcus
        { flightId: createdFlights[7].id, crewId: c3.id, assignedById: admin.id },

        // AI501 (DEL→CDG): Capt. Erikson + Omar
        { flightId: createdFlights[8].id, crewId: c5.id, assignedById: admin.id },
        { flightId: createdFlights[8].id, crewId: c11.id, assignedById: admin.id },

        // BA601 (LHR→ORD): F/O Aisha + Sarah
        { flightId: createdFlights[9].id, crewId: c4.id, assignedById: scheduler.id },
        { flightId: createdFlights[9].id, crewId: c6.id, assignedById: scheduler.id },

        // BA602 (ORD→LHR): Capt. Wilson + David + Carlos
        { flightId: createdFlights[10].id, crewId: c1.id, assignedById: admin.id },
        { flightId: createdFlights[10].id, crewId: c7.id, assignedById: admin.id },
        { flightId: createdFlights[10].id, crewId: c9.id, assignedById: admin.id },

        // EK303 (DXB→SIN): Capt. Sharma + Mei + Yuki
        { flightId: createdFlights[11].id, crewId: c2.id, assignedById: admin.id },
        { flightId: createdFlights[11].id, crewId: c8.id, assignedById: admin.id },
        { flightId: createdFlights[11].id, crewId: c12.id, assignedById: admin.id },

        // AF701 (CDG→NRT): F/O Marcus + Anya
        { flightId: createdFlights[12].id, crewId: c3.id, assignedById: scheduler.id },
        { flightId: createdFlights[12].id, crewId: c10.id, assignedById: scheduler.id },

        // LH801 (FRA→LAX): Capt. Erikson + Omar
        { flightId: createdFlights[13].id, crewId: c5.id, assignedById: admin.id },
        { flightId: createdFlights[13].id, crewId: c11.id, assignedById: admin.id },

        // TK901 (IST→JFK): F/O Aisha + Sarah
        { flightId: createdFlights[14].id, crewId: c4.id, assignedById: scheduler.id },
        { flightId: createdFlights[14].id, crewId: c6.id, assignedById: scheduler.id },

        // CX1001 (HKG→LHR): Capt. Wilson + David + Carlos
        { flightId: createdFlights[15].id, crewId: c1.id, assignedById: admin.id },
        { flightId: createdFlights[15].id, crewId: c7.id, assignedById: admin.id },
        { flightId: createdFlights[15].id, crewId: c9.id, assignedById: admin.id },

        // EY1101 (AUH→MEL): Capt. Sharma + Mei + Anya
        { flightId: createdFlights[16].id, crewId: c2.id, assignedById: admin.id },
        { flightId: createdFlights[16].id, crewId: c8.id, assignedById: admin.id },
        { flightId: createdFlights[16].id, crewId: c10.id, assignedById: admin.id },

        // UA1201 (SFO→NRT) - March 15 11:00 to March 16 14:00
        { flightId: createdFlights[17].id, crewId: c3.id, assignedById: scheduler.id },
        { flightId: createdFlights[17].id, crewId: c11.id, assignedById: scheduler.id },

        // MH1301 (KUL→LHR)
        { flightId: createdFlights[18].id, crewId: c5.id, assignedById: admin.id },
        { flightId: createdFlights[18].id, crewId: c6.id, assignedById: admin.id },

        // 🚨 INTENTIONAL CONFLICTS FOR TESTING 🚨
        // EY1101 (AUH→MEL) departs March 15 08:15 to March 15 23:15
        // Assigning c3 (F/O Marcus) and c11 (Omar) to EY1101, but they are already on UA1201 from SFO beginning Mar 15 11:00
        { flightId: createdFlights[16].id, crewId: c3.id, assignedById: scheduler.id },
        { flightId: createdFlights[16].id, crewId: c11.id, assignedById: scheduler.id },
        // Assigning c5 (Capt Erikson) to both AF701 (Mar 13 10:30) and LH801 (Mar 13 13:00) which overlap completely
        { flightId: createdFlights[12].id, crewId: c5.id, assignedById: admin.id },
    ];

    // Flights 19–24 (EK404, AA1401, SQ501, NH1501, EK550, WB1601) left UNSCHEDULED for demo

    for (const s of scheduleAssignments) {
        await prisma.schedule.create({ data: s });
    }
    console.log(`✅ ${scheduleAssignments.length} schedule assignments created...`);

    // ─── AVAILABILITY ─────────────────────────────────────────────────────────
    const today = new Date('2026-03-02');
    const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

    const availabilityData = [];
    const allCrewIds = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13];
    const statusCycles = [
        ['available', 'available', 'off', 'available', 'available', 'available', 'off'],
        ['off', 'available', 'available', 'available', 'available', 'off', 'available'],
        ['available', 'available', 'available', 'off', 'available', 'available', 'available'],
        ['available', 'off', 'available', 'available', 'available', 'available', 'off'],
        ['available', 'available', 'available', 'available', 'off', 'available', 'available'],
        ['off', 'off', 'available', 'available', 'available', 'available', 'available'],
        ['available', 'available', 'off', 'off', 'available', 'available', 'available'],
        ['available', 'available', 'available', 'available', 'available', 'off', 'available'],
        ['busy', 'available', 'available', 'off', 'available', 'available', 'available'],
        ['available', 'busy', 'available', 'available', 'off', 'available', 'available'],
        ['available', 'available', 'busy', 'available', 'available', 'off', 'available'],
        ['off', 'off', 'off', 'available', 'available', 'available', 'available'],
        ['off', 'off', 'off', 'off', 'off', 'off', 'off'], // Elena on full leave
    ];

    allCrewIds.forEach((crew, ci) => {
        for (let d = 0; d < 14; d++) {
            const statusIdx = d % statusCycles[ci].length;
            availabilityData.push({
                crewId: crew.id,
                availableDate: addDays(today, d),
                status: statusCycles[ci][statusIdx]
            });
        }
    });

    for (const a of availabilityData) {
        await prisma.availability.create({ data: a });
    }
    console.log(`✅ ${availabilityData.length} availability records seeded...`);

    // ─── DEFAULT SCHEDULING RULES ─────────────────────────────────────────────
    const defaultRules = [
        { name: 'Max Daily Duty Hours', value: 12, unit: 'hrs', description: 'Maximum consecutive hours a crew member can work in a 24-hour period.' },
        { name: 'Min Rest Period', value: 10, unit: 'hrs', description: 'Minimum rest time required between two consecutive duty periods.' },
        { name: 'Max Weekly Duty Hours', value: 40, unit: 'hrs', description: 'Maximum total duty hours allowed per rolling 7-day week.' },
        { name: 'Min Crew Per Flight', value: 3, unit: 'pers', description: 'Minimum number of crew members (pilots + cabin) for standard flights.' },
        { name: 'Max Sectors Per Day', value: 4, unit: 'sectors', description: 'Maximum number of individual flight legs per crew per day.' },
        { name: 'Long Haul Rest Bonus', value: 2, unit: 'hrs', description: 'Extra rest hours required after flights exceeding 8 hours.' },
    ];
    for (const rule of defaultRules) {
        await prisma.rule.create({ data: rule });
    }
    console.log('✅ Scheduling rules seeded...');

    // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
    const allUserIds = [admin.id, scheduler.id, scheduler2.id, u1.id, u2.id, u3.id, u4.id, u5.id, u6.id, u7.id];

    const notifications = [
        // Admin notifications
        { userId: admin.id, message: 'Crew scheduling system initialized with 25 flights and 13 crew members.', type: 'success' },
        { userId: admin.id, message: 'EK102 (LHR→DXB) is now showing DELAYED status. Crew rest buffer may be affected.', type: 'warning' },
        { userId: admin.id, message: 'SQ402 (SYD→SIN) has been CANCELLED. Crew reassignment required.', type: 'critical' },
        { userId: admin.id, message: 'EK404 (DXB→JFK) has been CANCELLED. Check crew compliance.', type: 'critical' },
        { userId: admin.id, message: 'Monthly compliance report is ready for download.', type: 'info' },
        { userId: admin.id, message: 'Capt. Wilson is approaching 38 hrs duty this week — monitor closely.', type: 'warning' },

        // Scheduler notifications
        { userId: scheduler.id, message: '6 flights are pending crew assignment. Run Auto-Generate to assign.', type: 'warning' },
        { userId: scheduler.id, message: 'QR302 (JFK→DOH) is showing as delayed. Crew has been notified.', type: 'info' },
        { userId: scheduler.id, message: 'Auto-schedule generation completed: 19 assignments made successfully.', type: 'success' },
        { userId: scheduler.id, message: 'Rest period conflict detected on F/O Aisha Rahman for TK901.', type: 'critical' },
        { userId: scheduler.id, message: 'Elena Vasquez is currently on leave. Do not assign until March 28.', type: 'info' },

        // Pilot notifications
        { userId: u1.id, message: 'You have been assigned to QR302 (JFK→DOH) on March 7. Check your schedule.', type: 'info' },
        { userId: u1.id, message: 'CX1001 (HKG→LHR) added to your roster on March 14. Confirm availability.', type: 'info' },
        { userId: u1.id, message: 'Weekly duty limit: 38 hrs used of 40 hrs maximum. One flight remaining.', type: 'warning' },
        { userId: u2.id, message: 'SQ401 crew briefing at 08:00 UTC, March 8. Gate G21.', type: 'info' },
        { userId: u2.id, message: 'EY1101 (AUH→MEL) assigned on March 15. Aircraft: A380. Confirm.', type: 'info' },
        { userId: u3.id, message: 'AF701 (CDG→NRT) departs at 10:30 UTC, March 13. Gate N20.', type: 'info' },
        { userId: u3.id, message: 'Rest requirement: You must have 10 hrs rest before March 13 departure.', type: 'warning' },
        { userId: u4.id, message: 'You have been rescheduled from SQ402 (CANCELLED) to TK901 (IST→JFK).', type: 'warning' },
        { userId: u5.id, message: 'LH801 (FRA→LAX): Departure at 13:00 UTC. Pre-flight briefing at 11:30.', type: 'info' },

        // Cabin crew notifications
        { userId: u6.id, message: 'You are assigned as Lead Purser on EK101 (DXB→LHR), March 5. Gate A14.', type: 'success' },
        { userId: u6.id, message: 'TK901 crew briefing document has been uploaded. Please review.', type: 'info' },
        { userId: u7.id, message: 'SQ401 departs at 10:00 UTC. Cabin setup crew must report 3 hrs prior.', type: 'info' },
    ];

    // Stagger createdAt timestamps for realism
    for (let i = 0; i < notifications.length; i++) {
        const hoursAgo = notifications.length - i;
        await prisma.notification.create({
            data: {
                ...notifications[i],
                createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
            }
        });
    }
    console.log(`✅ ${notifications.length} notifications seeded...`);

    // ─── SUMMARY ──────────────────────────────────────────────────────────────
    console.log('\n🎉 Database fully seeded with rich aviation data!\n');
    console.log('📋 Summary:');
    console.log('  👤 16 Users (1 Admin, 2 Schedulers, 5 Pilots, 8 Cabin Crew)');
    console.log('  ✈️  25 Flights (19 scheduled, 6 pending AI assignment)');
    console.log(`  📋 ${scheduleAssignments.length} Schedule assignments`);
    console.log(`  📅 ${availabilityData.length} Availability records`);
    console.log(`  🔔 ${notifications.length} Notifications`);
    console.log('  ⚙️  6 Scheduling rules');
    console.log('\n🔑 Login credentials (password: password123):');
    console.log('  Admin:     admin@airline.com');
    console.log('  Scheduler: scheduler@airline.com  /  dispatch@airline.com');
    console.log('  Pilots:    pilot1@airline.com → pilot5@airline.com');
    console.log('  Cabin:     cabin1@airline.com → cabin8@airline.com');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
