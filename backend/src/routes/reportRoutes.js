const express = require('express');
const { downloadWorkloadReport, getUtilizationStats } = require('../controllers/reportController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/workload/download', authMiddleware, roleMiddleware(['admin', 'scheduler']), downloadWorkloadReport);
router.get('/utilization', authMiddleware, roleMiddleware(['admin', 'scheduler']), getUtilizationStats);

module.exports = router;
