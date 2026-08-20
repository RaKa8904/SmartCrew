const express = require('express');
const {
    downloadWorkloadReport,
    getUtilizationStats,
    downloadFlightAssignmentsReport,
    getFlightAssignmentsStats,
    getAdvancedAnalytics,
    getFatiguePreview,
    getSmartRecommendations
} = require('../controllers/reportController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/workload/download', authMiddleware, roleMiddleware(['admin', 'scheduler']), downloadWorkloadReport);
router.get('/utilization', authMiddleware, roleMiddleware(['admin', 'scheduler']), getUtilizationStats);
router.get('/assignments/download', authMiddleware, roleMiddleware(['admin', 'scheduler']), downloadFlightAssignmentsReport);
router.get('/assignments', authMiddleware, roleMiddleware(['admin', 'scheduler']), getFlightAssignmentsStats);
router.get('/advanced', authMiddleware, roleMiddleware(['admin', 'scheduler']), getAdvancedAnalytics);
router.get('/fatigue/preview', authMiddleware, roleMiddleware(['admin', 'scheduler']), getFatiguePreview);
router.get('/fatigue/recommendations', authMiddleware, roleMiddleware(['admin', 'scheduler']), getSmartRecommendations);

module.exports = router;
