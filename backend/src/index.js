const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const crewRoutes = require('./routes/crewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { seedDefaultRules } = require('./controllers/ruleController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Crew Scheduling API is running');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // Auto-seed default scheduling rules if none exist yet
    await seedDefaultRules();
});
