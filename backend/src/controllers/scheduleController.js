const { generateSchedule, getConflicts } = require('../services/schedulingService');

const triggerAutoGenerate = async (req, res) => {
    try {
        const assignments = await generateSchedule();
        res.json({ message: 'Schedules generated successfully', assignments });
    } catch (error) {
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
