const express = require('express');
const { getMyCrewProfile, getAllCrew, getCrewDetails, updateCrew, deleteCrew, updateAvailability } = require('../controllers/crewController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, getMyCrewProfile);  // Any authenticated crew member
router.get('/', authMiddleware, roleMiddleware(['admin', 'scheduler']), getAllCrew);
router.get('/:id', authMiddleware, getCrewDetails);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateCrew);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteCrew);
router.post('/:id/availability', authMiddleware, updateAvailability);

module.exports = router;
