const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const portalController = require('../controllers/crewPortalController');

const router = express.Router();

// Common: any crew member can use these
router.post('/leave', authMiddleware, roleMiddleware(['crew']), portalController.requestLeave);
router.get('/leave/my-requests', authMiddleware, roleMiddleware(['crew']), portalController.getMyLeaveRequests);

router.post('/swap', authMiddleware, roleMiddleware(['crew']), portalController.requestSwap);
router.put('/swap/:id/respond', authMiddleware, roleMiddleware(['crew']), portalController.respondToSwap);
router.get('/swap/my-requests', authMiddleware, roleMiddleware(['crew']), portalController.getMySwapRequests);

router.post('/bid', authMiddleware, roleMiddleware(['crew']), portalController.placeBid);
router.get('/bid/my-bids', authMiddleware, roleMiddleware(['crew']), portalController.getMyBids);

// Admin / Scheduler routes to review requests
router.get('/admin/leave', authMiddleware, roleMiddleware(['admin', 'scheduler']), portalController.getAllLeaveRequests);
router.put('/admin/leave/:id', authMiddleware, roleMiddleware(['admin', 'scheduler']), portalController.processLeaveRequest);

router.get('/admin/swap', authMiddleware, roleMiddleware(['admin', 'scheduler']), portalController.getAllSwapRequests);
router.put('/admin/swap/:id', authMiddleware, roleMiddleware(['admin', 'scheduler']), portalController.processSwapRequest);

router.get('/admin/bids', authMiddleware, roleMiddleware(['admin', 'scheduler']), portalController.getAllBids);
router.put('/admin/bids/:id/award', authMiddleware, roleMiddleware(['admin', 'scheduler']), portalController.awardBid);

module.exports = router;
