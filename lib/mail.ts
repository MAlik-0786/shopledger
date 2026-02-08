import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: `"ShopLedger" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

export const sendOTPEmail = async (to: string, otp: string) => {
    const subject = 'Password Reset OTP - ShopLedger';
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
            <h2 style="color: #6366f1; text-align: center;">ShopLedger</h2>
            <p>Hello,</p>
            <p>You requested to reset your password. Use the following OTP to verify your request. This OTP is valid for 10 minutes.</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; ${new Date().getFullYear()} ShopLedger. All rights reserved.</p>
        </div>
    `;
    return await sendEmail(to, subject, html);
};
