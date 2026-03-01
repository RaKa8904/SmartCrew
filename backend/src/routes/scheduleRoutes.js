const express = require('express');
const { triggerAutoGenerate, fetchConflicts } = require('../controllers/scheduleController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', authMiddleware, roleMiddleware(['admin', 'scheduler']), triggerAutoGenerate);
router.get('/conflicts', authMiddleware, roleMiddleware(['admin', 'scheduler']), fetchConflicts);

module.exports = router;
