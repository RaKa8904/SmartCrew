const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const flights = await prisma.flight.findMany();
    console.log("Total flights in DB:", flights.length);
    if (flights.length > 0) {
        console.log("Sample flight:", flights[0].flightNumber, flights[0].status, flights[0].departureTime, flights[0].arrivalTime);

        // Check how many match 'on-time' or 'delayed'
        const match = await prisma.flight.count({
            where: { status: { in: ['on-time', 'delayed'] } }
        });
        console.log("Matches for on-time/delayed:", match);
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
