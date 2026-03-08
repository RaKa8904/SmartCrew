const { PrismaClient } = require('@prisma/client');
const { sendPushNotification } = require('../services/pushNotificationService');

const prisma = new PrismaClient();

// Leave Requests
const requestLeave = async (req, res) => {
    try {
        const userId = req.user.id;
        const crew = await prisma.crew.findUnique({ where: { userId } });
        if (!crew) return res.status(404).json({ message: 'Crew profile not found' });

        const { startDate, endDate, reason } = req.body;
        const leave = await prisma.leaveRequest.create({
            data: {
                crewId: crew.id,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason
            }
        });
        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyLeaveRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const crew = await prisma.crew.findUnique({ where: { userId } });
        const leaves = await prisma.leaveRequest.findMany({
            where: { crewId: crew.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllLeaveRequests = async (req, res) => {
    try {
        const leaves = await prisma.leaveRequest.findMany({
            include: { crew: { include: { user: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const processLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // approved or rejected
        const leave = await prisma.leaveRequest.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { crew: true }
        });

        // Notify the crew member
        const msg = `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been ${status}.`;
        await prisma.notification.create({
            data: {
                userId: leave.crew.userId,
                message: msg,
                type: status === 'approved' ? 'success' : (status === 'rejected' ? 'critical' : 'info')
            }
        });
        await sendPushNotification(leave.crew.userId, 'Leave Request Update', msg);

        // If approved, ideally we should unassign schedules falling in this range, but keeping it simple for now
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Shift Swaps
const requestSwap = async (req, res) => {
    try {
        const userId = req.user.id;
        const requestorCrew = await prisma.crew.findUnique({ where: { userId } });
        const { scheduleId, targetUserId } = req.body; // targetUserId is optional

        let targetCrewId = null;
        if (targetUserId) {
            const targetCrew = await prisma.crew.findUnique({ where: { userId: targetUserId } });
            if (targetCrew) targetCrewId = targetCrew.id;
        }

        const swap = await prisma.shiftSwapRequest.create({
            data: {
                requestorId: requestorCrew.id,
                targetCrewId,
                scheduleId,
                status: targetCrewId ? 'pending_peer' : 'pending_admin'
            }
        });
        res.status(201).json(swap);
    } catch (error) {
        console.error("SWAP ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMySwapRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const crew = await prisma.crew.findUnique({ where: { userId } });
        const swaps = await prisma.shiftSwapRequest.findMany({
            where: {
                OR: [
                    { requestorId: crew.id },
                    { targetCrewId: crew.id }
                ]
            },
            include: {
                schedule: { include: { flight: true } },
                requestor: { include: { user: true } },
                targetCrew: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(swaps);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const respondToSwap = async (req, res) => {
    try {
        const { id } = req.params; // swap id
        const { accept } = req.body;
        const userId = req.user.id;
        const crew = await prisma.crew.findUnique({ where: { userId } });

        const swap = await prisma.shiftSwapRequest.findUnique({ where: { id: parseInt(id) } });
        if (swap.targetCrewId !== crew.id) return res.status(403).json({ message: 'Not authorized' });

        const status = accept ? 'pending_admin' : 'rejected';
        const updatedSwap = await prisma.shiftSwapRequest.update({
            where: { id: swap.id },
            data: { status }
        });
        res.json(updatedSwap);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllSwapRequests = async (req, res) => {
    try {
        const swaps = await prisma.shiftSwapRequest.findMany({
            include: {
                schedule: { include: { flight: true } },
                requestor: { include: { user: true } },
                targetCrew: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(swaps);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const processSwapRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, finalTargetUserId } = req.body; // finalTargetUserId if target was empty and admin assigns it

        const swap = await prisma.shiftSwapRequest.findUnique({
            where: { id: parseInt(id) },
            include: { requestor: true, targetCrew: true }
        });

        let updatedCrewId = swap.targetCrewId;
        if (finalTargetUserId && !updatedCrewId) {
            const temp = await prisma.crew.findUnique({ where: { userId: finalTargetUserId } });
            updatedCrewId = temp?.id;
        }

        if (status === 'approved' && updatedCrewId) {
            await prisma.$transaction([
                prisma.schedule.update({
                    where: { id: swap.scheduleId },
                    data: { crewId: updatedCrewId }
                }),
                prisma.shiftSwapRequest.update({
                    where: { id: swap.id },
                    data: { status: 'approved', targetCrewId: updatedCrewId }
                }),
                prisma.notification.create({
                    data: {
                        userId: swap.requestor.userId,
                        message: `Your shift swap request has been approved and assigned.`,
                        type: 'success'
                    }
                }),
                prisma.notification.create({
                    data: {
                        userId: (swap.targetCrewId ? swap.targetCrew.userId : finalTargetUserId),
                        message: `You have been assigned a new flight via a shift swap.`,
                        type: 'info'
                    }
                })
            ]);
            await sendPushNotification(swap.requestor.userId, 'Shift Swap Approved', 'Your shift swap request has been approved and assigned.');
            await sendPushNotification((swap.targetCrewId ? swap.targetCrew.userId : finalTargetUserId), 'New Flight Assignment', 'You have been assigned a new flight via a shift swap.');
            return res.json({ message: 'Swap approved and schedule updated' });
        }

        const rejSwap = await prisma.shiftSwapRequest.update({
            where: { id: swap.id },
            data: { status }
        });

        const rejMsg = `Your shift swap request has been ${status}.`;
        await prisma.notification.create({
            data: {
                userId: swap.requestor.userId,
                message: rejMsg,
                type: 'critical'
            }
        });
        await sendPushNotification(swap.requestor.userId, 'Shift Swap Update', rejMsg);

        res.json(rejSwap);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Shift Bidding
const placeBid = async (req, res) => {
    try {
        const userId = req.user.id;
        const crew = await prisma.crew.findUnique({ where: { userId } });
        const { flightId } = req.body;

        const bid = await prisma.shiftBid.create({
            data: {
                crewId: crew.id,
                flightId: parseInt(flightId),
                status: 'placed'
            }
        });
        res.status(201).json(bid);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyBids = async (req, res) => {
    try {
        const userId = req.user.id;
        const crew = await prisma.crew.findUnique({ where: { userId } });
        const bids = await prisma.shiftBid.findMany({
            where: { crewId: crew.id },
            include: { flight: true },
            orderBy: { bidTimestamp: 'desc' }
        });
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllBids = async (req, res) => {
    try {
        const bids = await prisma.shiftBid.findMany({
            include: { flight: true, crew: { include: { user: true } } },
            orderBy: { bidTimestamp: 'desc' }
        });
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const awardBid = async (req, res) => {
    try {
        const { id } = req.params; // bid Id
        const bid = await prisma.shiftBid.findUnique({ where: { id: parseInt(id) } });

        await prisma.$transaction(async (tx) => {
            // update this bid to won
            await tx.shiftBid.update({
                where: { id: bid.id },
                data: { status: 'won' }
            });
            // update other bids on this flight to lost
            await tx.shiftBid.updateMany({
                where: { flightId: bid.flightId, id: { not: bid.id } },
                data: { status: 'lost' }
            });

            // generate schedule
            await tx.schedule.create({
                data: {
                    flightId: bid.flightId,
                    crewId: bid.crewId,
                    assignedById: req.user.id
                }
            });
        });
        res.json({ message: 'Bid awarded and scheduled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    requestLeave, getMyLeaveRequests, getAllLeaveRequests, processLeaveRequest,
    requestSwap, getMySwapRequests, respondToSwap, getAllSwapRequests, processSwapRequest,
    placeBid, getMyBids, getAllBids, awardBid
};
