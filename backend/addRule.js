const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEmailRule() {
    try {
        const existing = await prisma.rule.findUnique({
            where: { name: 'Enable Email Notifications' }
        });

        if (!existing) {
            await prisma.rule.create({
                data: {
                    name: 'Enable Email Notifications',
                    value: 0, // Default to OFF since user finds it annoying
                    unit: 'bool',
                    description: 'Allow system to send emails (1=Yes, 0=No)'
                }
            });
            console.log("✅ Email rule added successfully.");
        } else {
            console.log("Rule already exists.");
        }
    } catch (err) {
        console.error("Error adding rule:", err);
    } finally {
        await prisma.$disconnect();
    }
}

addEmailRule();
