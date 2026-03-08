const { generateSchedule, getConflicts } = require('../services/schedulingService');
const { sendEmail } = require('../services/emailService');

const triggerAutoGenerate = async (req, res) => {
    try {
        const result = await generateSchedule(req.user.id);
        if (req.io) req.io.emit('schedule_generated', result);
        res.json({
            message: `Schedule generation complete. ${result.flightsScheduled} flights assigned crew.`,
            ...result,
        });
    } catch (error) {
        console.error('Auto-schedule error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const fetchConflicts = async (req, res) => {
    try {
        const conflicts = await getConflicts();
        res.json(conflicts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const assignSchedule = async (req, res) => {
    try {
        const { flightId, crewId } = req.body;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Basic check if already assigned
        const existing = await prisma.schedule.findFirst({
            where: { flightId: parseInt(flightId), crewId: parseInt(crewId) }
        });
        if (existing) return res.status(400).json({ message: 'Crew already assigned to this flight' });

        // We can add more complex rule checks here, but for now we trust the drag-and-drop
        const assignment = await prisma.schedule.create({
            data: {
                flightId: parseInt(flightId),
                crewId: parseInt(crewId),
                assignedById: req.user.id
            },
            include: {
                crew: { include: { user: true } },
                flight: true
            }
        });

        // Create in-app notification
        await prisma.notification.create({
            data: {
                userId: assignment.crew.userId,
                message: `You have been manually assigned to flight ${assignment.flight.flightNumber} (${assignment.flight.origin} ✈️ ${assignment.flight.destination}) departing on ${new Date(assignment.flight.departureTime).toLocaleDateString()}.`,
                type: 'info'
            }
        });

        // Send email notification to the assigned crew member
        if (assignment.crew?.user?.email) {
            const flightTime = new Date(assignment.flight.departureTime).toLocaleString();
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0ea5e9;">New Flight Assignment</h2>
                    <p>Hello <strong>${assignment.crew.user.name}</strong>,</p>
                    <p>You have been manually assigned to a new flight by the scheduling team.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Flight Number:</strong> ${assignment.flight.flightNumber}</p>
                        <p style="margin: 5px 0;"><strong>Route:</strong> ${assignment.flight.origin} ✈️ ${assignment.flight.destination}</p>
                        <p style="margin: 5px 0;"><strong>Departure:</strong> ${flightTime}</p>
                    </div>
                    <p>Please log in to the SmartCrew portal to check your updated roster.</p>
                    <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated message from the Smart Flight Crew Scheduling System.</p>
                </div>
            `;
            // Fire and forget email to not block response
            sendEmail(assignment.crew.user.email, `Flight Assignment: ${assignment.flight.flightNumber}`, emailHtml);
        }

        if (req.io) req.io.emit('schedule_generated', { message: 'Manual assignment' });

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Manual assign error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const unassignSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const schedule = await prisma.schedule.findUnique({
            where: { id: parseInt(scheduleId) },
            include: { crew: true, flight: true }
        });

        if (schedule) {
            await prisma.notification.create({
                data: {
                    userId: schedule.crew.userId,
                    message: `You have been removed from flight ${schedule.flight.flightNumber} (${schedule.flight.origin} ✈️ ${schedule.flight.destination}).`,
                    type: 'warning'
                }
            });
            await prisma.schedule.delete({
                where: { id: parseInt(scheduleId) }
            });
        }

        if (req.io) req.io.emit('schedule_generated', { message: 'Manual unassignment' });

        res.json({ message: 'Crew member removed from flight successfully' });
    } catch (error) {
        console.error('Manual unassign error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { triggerAutoGenerate, fetchConflicts, assignSchedule, unassignSchedule };
