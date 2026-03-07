const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const crewRoutes = require('./routes/crewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const portalRoutes = require('./routes/crewPortalRoutes');
const { seedDefaultRules } = require('./controllers/ruleController');
const { startFleetTracker } = require('./services/fleetTrackerService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger for debugging mobile connectivity
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - from ${req.ip}`);
    next();
});

// Attach io to req for endpoints to emit events
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('Client connected completely:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

app.get('/', (req, res) => {
    res.send('Crew Scheduling API is running');
});

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server is running on port ${PORT} (bound to 0.0.0.0)`);
    // Auto-seed default scheduling rules if none exist yet
    await seedDefaultRules();
    // Start the background tracking service
    startFleetTracker(io);
});
