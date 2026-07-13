const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Rate Limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' }
});

// Apply global rate limiter to all API endpoints
app.use('/api', globalLimiter);

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

app.use('/api/auth', authLimiter, authRoutes);
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
