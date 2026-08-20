const express = require('express');
const { getModelStatus, retrainModel } = require('../controllers/aiController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/model-status', authMiddleware, roleMiddleware(['admin', 'scheduler']), getModelStatus);
router.post('/retrain', authMiddleware, roleMiddleware(['admin', 'scheduler']), retrainModel);

module.exports = router;
