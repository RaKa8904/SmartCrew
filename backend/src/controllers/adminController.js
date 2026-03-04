const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const stream = require('stream');

const prisma = new PrismaClient();

const uploadCrewCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                let inserted = 0;
                let failed = 0;
                const detailed_errors = [];
                const total_rows = results.length;

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    const rowNum = i + 1; // 1-based index (data rows)
                    const { name, email, crew_type, qualification, max_hours_per_week, status } = row;

                    // Validations
                    if (!name || !name.trim()) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'Name is required' });
                        continue;
                    }
                    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'Valid email is required' });
                        continue;
                    }
                    // crew_type must be pilot or cabin (we also accept cabin_crew for compatibility)
                    if (!crew_type || !['pilot', 'cabin', 'cabin_crew'].includes(crew_type.toLowerCase())) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'crew_type must be pilot or cabin' });
                        continue;
                    }
                    const maxHoursStr = max_hours_per_week ? String(max_hours_per_week) : '';
                    if (!maxHoursStr.trim() || isNaN(Number(maxHoursStr))) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'max_hours_per_week must be numeric' });
                        continue;
                    }
                    if (!status || !['active', 'inactive'].includes(status.toLowerCase())) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'status must be active or inactive' });
                        continue;
                    }

                    // Check duplicate email
                    const existingUser = await prisma.user.findUnique({ where: { email } });
                    if (existingUser) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'Email already exists' });
                        continue;
                    }

                    try {
                        const hashedPassword = await bcrypt.hash('crew123', 10);

                        await prisma.$transaction(async (prismaTx) => {
                            const user = await prismaTx.user.create({
                                data: {
                                    name: name.trim(),
                                    email: email.trim(),
                                    password: hashedPassword,
                                    role: 'crew'
                                }
                            });

                            const parsedCrewType = crew_type.toLowerCase() === 'cabin' ? 'cabin_crew' : crew_type.toLowerCase();

                            await prismaTx.crew.create({
                                data: {
                                    userId: user.id,
                                    crewType: parsedCrewType,
                                    qualification: qualification || 'Standard',
                                    maxHoursPerWeek: Number(maxHoursStr),
                                    status: status.toLowerCase()
                                }
                            });
                        });

                        inserted++;
                    } catch (err) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: `Database error: ${err.message}` });
                    }
                }

                res.status(200).json({
                    total_rows,
                    inserted,
                    failed,
                    detailed_errors
                });
            })
            .on('error', (err) => {
                res.status(500).json({ message: 'Error parsing CSV', error: err.message });
            });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const uploadFlightCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                let inserted = 0;
                let failed = 0;
                const detailed_errors = [];
                const total_rows = results.length;

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    const rowNum = i + 1; // 1-based index (data rows)
                    const { flightNumber, origin, destination, departureTime, arrivalTime, aircraftType, status, gate, terminal } = row;

                    // Validations
                    if (!flightNumber || !flightNumber.trim()) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'flightNumber is required' });
                        continue;
                    }
                    if (!origin || !origin.trim()) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'origin is required' });
                        continue;
                    }
                    if (!destination || !destination.trim()) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'destination is required' });
                        continue;
                    }
                    if (!departureTime || isNaN(Date.parse(departureTime))) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'valid departureTime is required' });
                        continue;
                    }
                    if (!arrivalTime || isNaN(Date.parse(arrivalTime))) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'valid arrivalTime is required' });
                        continue;
                    }
                    if (new Date(arrivalTime) <= new Date(departureTime)) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'arrivalTime must be after departureTime' });
                        continue;
                    }
                    if (!aircraftType || !aircraftType.trim()) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'aircraftType is required' });
                        continue;
                    }

                    const parsedStatus = status && status.trim() ? status.trim().toLowerCase() : 'on-time';
                    if (!['on-time', 'delayed', 'cancelled'].includes(parsedStatus)) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'status must be on-time, delayed, or cancelled' });
                        continue;
                    }

                    // Check duplicate flightNumber
                    const existingFlight = await prisma.flight.findUnique({ where: { flightNumber: flightNumber.trim() } });
                    if (existingFlight) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: 'flightNumber already exists' });
                        continue;
                    }

                    try {
                        await prisma.flight.create({
                            data: {
                                flightNumber: flightNumber.trim(),
                                origin: origin.trim(),
                                destination: destination.trim(),
                                departureTime: new Date(departureTime),
                                arrivalTime: new Date(arrivalTime),
                                aircraftType: aircraftType.trim(),
                                status: parsedStatus,
                                gate: gate ? gate.trim() : null,
                                terminal: terminal ? terminal.trim() : null,
                            }
                        });

                        inserted++;
                    } catch (err) {
                        failed++;
                        detailed_errors.push({ row: rowNum, error: `Database error: ${err.message}` });
                    }
                }

                res.status(200).json({
                    total_rows,
                    inserted,
                    failed,
                    detailed_errors
                });
            })
            .on('error', (err) => {
                res.status(500).json({ message: 'Error parsing CSV', error: err.message });
            });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    uploadCrewCSV,
    uploadFlightCSV
};
