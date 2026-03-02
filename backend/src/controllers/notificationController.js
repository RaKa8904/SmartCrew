const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/notifications — get notifications for the logged-in user
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
    }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user.id, isRead: false },
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch unread count', error: err.message });
    }
};

// PATCH /api/notifications/:id/read — mark as read
const markAsRead = async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: { id: parseInt(req.params.id) },
            data: { isRead: true },
        });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark notification as read', error: err.message });
    }
};

// PATCH /api/notifications/mark-all-read
const markAllRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark all as read', error: err.message });
    }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
    try {
        await prisma.notification.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete notification', error: err.message });
    }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllRead, deleteNotification };
