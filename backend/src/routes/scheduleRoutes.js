const express = require('express');
const { triggerAutoGenerate, fetchConflicts } = require('../controllers/scheduleController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', authMiddleware, roleMiddleware(['admin', 'scheduler']), triggerAutoGenerate);
router.post('/assign', authMiddleware, roleMiddleware(['admin', 'scheduler']), require('../controllers/scheduleController').assignSchedule);
router.delete('/assign/:scheduleId', authMiddleware, roleMiddleware(['admin', 'scheduler']), require('../controllers/scheduleController').unassignSchedule);
router.get('/conflicts', authMiddleware, roleMiddleware(['admin', 'scheduler']), fetchConflicts);

module.exports = router;
