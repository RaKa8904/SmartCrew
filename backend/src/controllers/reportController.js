const { generateWorkloadReport, convertToCSV } = require('../services/reportingService');

const downloadWorkloadReport = async (req, res) => {
    try {
        const data = await generateWorkloadReport();
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=workload_report.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUtilizationStats = async (req, res) => {
    try {
        const data = await generateWorkloadReport();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { downloadWorkloadReport, getUtilizationStats };
