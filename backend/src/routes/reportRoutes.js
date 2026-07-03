const express = require('express');
const { downloadWorkloadReport, getUtilizationStats, getAdvancedAnalytics, getFatiguePreview } = require('../controllers/reportController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/workload/download', authMiddleware, roleMiddleware(['admin', 'scheduler']), downloadWorkloadReport);
router.get('/utilization', authMiddleware, roleMiddleware(['admin', 'scheduler']), getUtilizationStats);
router.get('/advanced', authMiddleware, roleMiddleware(['admin', 'scheduler']), getAdvancedAnalytics);
router.get('/fatigue/preview', authMiddleware, roleMiddleware(['admin', 'scheduler']), getFatiguePreview);

module.exports = router;
