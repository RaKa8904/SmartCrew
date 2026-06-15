const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get own crew profile using JWT identity
const getMyCrewProfile = async (req, res) => {
    try {
        const crewMember = await prisma.crew.findUnique({
            where: { userId: req.user.id },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                schedules: { include: { flight: true } },
                availability: true
            }
        });
        if (!crewMember) {
            return res.status(404).json({ message: 'Crew profile not found for this user' });
        }
        res.json(crewMember);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllCrew = async (req, res) => {
    try {
        const crew = await prisma.crew.findMany({
            include: { user: { select: { id: true, name: true, email: true, role: true } }, schedules: true }
        });
        res.json(crew);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCrewDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const crewMember = await prisma.crew.findUnique({
            where: { id: parseInt(id) },
            include: { user: { select: { id: true, name: true, email: true, role: true } }, schedules: { include: { flight: true } }, availability: true }
        });
        if (!crewMember) {
            return res.status(404).json({ message: 'Crew member not found' });
        }
        res.json(crewMember);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateCrew = async (req, res) => {
    const { id } = req.params;
    const { crewType, qualification, maxHoursPerWeek, status, inactiveDayOfWeek } = req.body;
    try {
        const crew = await prisma.crew.update({
            where: { id: parseInt(id) },
            data: {
                crewType,
                qualification,
                maxHoursPerWeek: parseInt(maxHoursPerWeek),
                status,
                inactiveDayOfWeek: inactiveDayOfWeek || null,
            },
        });
        res.json(crew);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteCrew = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.crew.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Crew member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateAvailability = async (req, res) => {
    const { id } = req.params;
    const { availableDate, status, inactiveDayOfWeek } = req.body;
    try {
        if (inactiveDayOfWeek !== undefined) {
            const allowedDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (inactiveDayOfWeek && !allowedDays.includes(inactiveDayOfWeek)) {
                return res.status(400).json({ message: 'Invalid inactive day selected' });
            }

            const updatedCrew = await prisma.crew.update({
                where: { id: parseInt(id) },
                data: { inactiveDayOfWeek: inactiveDayOfWeek || null },
            });

            return res.status(200).json(updatedCrew);
        }

        const dateObj = new Date(availableDate);
        // Normalize the date
        const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);

        const existing = await prisma.availability.findFirst({
            where: {
                crewId: parseInt(id),
                availableDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        let availability;
        if (existing) {
            availability = await prisma.availability.update({
                where: { id: existing.id },
                data: { status }
            });
        } else {
            availability = await prisma.availability.create({
                data: {
                    crewId: parseInt(id),
                    availableDate: startOfDay,
                    status,
                },
            });
        }
        res.status(200).json(availability);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getMyCrewProfile, getAllCrew, getCrewDetails, updateCrew, deleteCrew, updateAvailability };
