const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const crewRoutes = require('./routes/crewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Crew Scheduling API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
