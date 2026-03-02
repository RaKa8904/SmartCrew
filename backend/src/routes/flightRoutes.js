const express = require('express');
const { getAllFlights, createFlight, updateFlight, patchFlight, deleteFlight } = require('../controllers/flightController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllFlights);
router.post('/', authMiddleware, roleMiddleware(['admin', 'scheduler']), createFlight);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'scheduler']), updateFlight);
router.patch('/:id', authMiddleware, roleMiddleware(['admin', 'scheduler']), patchFlight);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteFlight);

module.exports = router;
