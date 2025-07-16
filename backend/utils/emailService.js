const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});

async function sendOTP(email, otp) {
    try {
        console.log('Attempting to send OTP to:', email);

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff5c5c;">Verify Your Email</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #ff5c5c; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send OTP: ${error.message}`);
    }
}

module.exports = { sendOTP }; 