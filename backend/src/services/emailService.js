const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    // Using Ethereal Email for testing (or a provided SMTP)
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const emailRule = await prisma.rule.findUnique({
            where: { name: 'Enable Email Notifications' }
        });

        if (emailRule && emailRule.value === 0) {
            console.log(`🔇 Email to ${to} blocked by System Rule.`);
            return false;
        }
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP credentials missing. Email not sent to:', to);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"SmartCrew System" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: htmlContent
        });

        console.log('✅ Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
};

module.exports = { sendEmail };
