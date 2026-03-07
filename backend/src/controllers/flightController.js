const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllFlights = async (req, res) => {
    try {
        const flights = await prisma.flight.findMany({
            include: {
                schedules: {
                    include: {
                        crew: {
                            include: { user: true }
                        }
                    }
                }
            }
        });
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createFlight = async (req, res) => {
    const { flightNumber, origin, destination, departureTime, arrivalTime, aircraftType, status, gate, terminal } = req.body;
    try {
        const flight = await prisma.flight.create({
            data: {
                flightNumber,
                origin,
                destination,
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime),
                aircraftType,
                status: status || 'on-time',
                gate: gate || null,
                terminal: terminal || null,
            },
        });
        if (req.io) req.io.emit('flight_created', flight);
        res.status(201).json(flight);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateFlight = async (req, res) => {
    const { id } = req.params;
    const { flightNumber, origin, destination, departureTime, arrivalTime, aircraftType, status, gate, terminal } = req.body;
    try {
        const flight = await prisma.flight.update({
            where: { id: parseInt(id) },
            data: {
                flightNumber,
                origin,
                destination,
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime),
                aircraftType,
                ...(status && { status }),
                ...(gate !== undefined && { gate }),
                ...(terminal !== undefined && { terminal }),
            },
        });
        res.json(flight);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const patchFlight = async (req, res) => {
    const { id } = req.params;
    const { status, gate, terminal } = req.body;
    try {
        const flight = await prisma.flight.update({
            where: { id: parseInt(id) },
            data: {
                ...(status && { status }),
                ...(gate !== undefined && { gate }),
                ...(terminal !== undefined && { terminal }),
            },
        });
        res.json(flight);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteFlight = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.flight.delete({ where: { id: parseInt(id) } });
        if (req.io) req.io.emit('flight_deleted', parseInt(id));
        res.json({ message: 'Flight deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllFlights, createFlight, updateFlight, patchFlight, deleteFlight };
