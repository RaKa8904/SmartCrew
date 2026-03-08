const { Expo } = require('expo-server-sdk');
const { PrismaClient } = require('@prisma/client');

const expo = new Expo();
const prisma = new PrismaClient();

const sendPushNotification = async (userId, title, body, data = {}) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { expoPushToken: true }
        });

        if (!user || !user.expoPushToken) {
            console.log(`[Push] User ${userId} has no registered push token. Skipping.`);
            return;
        }

        if (!Expo.isExpoPushToken(user.expoPushToken)) {
            console.error(`[Push] Token ${user.expoPushToken} is not a valid Expo push token`);
            return;
        }

        const messages = [{
            to: user.expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        }];

        const chunks = expo.chunkPushNotifications(messages);

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log('[Push] Notification dispatched:', ticketChunk);
            } catch (error) {
                console.error('[Push] Error sending chunk', error);
            }
        }
    } catch (err) {
        console.error('[Push] Fatal error pushing notification:', err);
    }
};

module.exports = { sendPushNotification };
