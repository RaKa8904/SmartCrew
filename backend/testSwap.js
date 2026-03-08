const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const requestorCrew = await prisma.crew.findFirst();
        console.log("Requestor:", requestorCrew.id);

        const schedule = await prisma.schedule.findFirst();
        console.log("Schedule:", schedule.id);

        const swap = await prisma.shiftSwapRequest.create({
            data: {
                requestorId: requestorCrew.id,
                targetCrewId: null,
                scheduleId: schedule.id,
                status: 'pending_admin'
            }
        });
        console.log("Success:", swap);
    } catch (err) {
        console.error("SWAP ERROR:", err);
    }
}
test();
