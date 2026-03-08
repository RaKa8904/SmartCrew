const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
    savePushToken,
} = require('../controllers/notificationController');

router.use(authMiddleware);


router.get('/', getNotifications);
router.post('/push-token', savePushToken);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
