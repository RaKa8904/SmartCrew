const { generateWorkloadReport, generateFlightAssignmentsReport, convertToCSV, getAdvancedAnalytics: fetchAdvancedAnalytics } = require('../services/reportingService');
const { getFatiguePreview: fetchFatiguePreview, getSmartRecommendations: fetchRecommendations } = require('../services/fatigueRiskService');

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

const downloadFlightAssignmentsReport = async (req, res) => {
    try {
        const data = await generateFlightAssignmentsReport();
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=flight_assignments_report.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getFlightAssignmentsStats = async (req, res) => {
    try {
        const data = await generateFlightAssignmentsReport();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAdvancedAnalytics = async (req, res) => {
    try {
        const data = await fetchAdvancedAnalytics();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getFatiguePreview = async (req, res) => {
    try {
        const { flightId, crewId } = req.query;
        const data = await fetchFatiguePreview({ flightId, crewId });
        res.json(data);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: 'Server error', error: error.message });
    }
};

const getSmartRecommendations = async (req, res) => {
    try {
        const { flightId } = req.query;
        if (!flightId) {
            return res.status(400).json({ message: 'flightId query parameter is required' });
        }
        const data = await fetchRecommendations(flightId);
        res.json({ recommendations: data });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    downloadWorkloadReport,
    getUtilizationStats,
    downloadFlightAssignmentsReport,
    getFlightAssignmentsStats,
    getAdvancedAnalytics,
    getFatiguePreview,
    getSmartRecommendations
};
