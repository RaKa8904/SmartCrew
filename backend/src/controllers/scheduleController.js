const { generateSchedule, getConflicts } = require('../services/schedulingService');

const triggerAutoGenerate = async (req, res) => {
    try {
        const result = await generateSchedule(req.user.id);
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

module.exports = { triggerAutoGenerate, fetchConflicts };
