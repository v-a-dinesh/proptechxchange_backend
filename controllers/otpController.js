import OTP from '../models/OTP.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Function to generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to send OTP via email
const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your OTP for PropTechXchange Verification",
    text: `Welcome to PropTechXchange, a real-time auction platform!

Your OTP is: ${otp}. It will expire in 10 minutes.

Thank you for choosing PropTechXchange. We're excited to have you on board! To get started, please enter this OTP in the registration form.

If you encounter any issues or have questions, feel free to reach out to our support team at:
- General Inquiries: proptechxchange@gmail.com
- Manager: managerproptechxchange@gmail.com

We look forward to helping you find your perfect property!

Best regards,
The PropTechXchange Team`,
});
};

// Controller for sending OTP
export const sendVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        await OTP.findOneAndUpdate(
            { email },
            { email, otp, expiresAt },
            { upsert: true, new: true }
        );

        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Error sending OTP" });
    }
};

// Controller for verifying OTP
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(404).json({ message: "OTP not found" });
        }

        if (otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is valid, remove it from the database
        await OTP.deleteOne({ email });

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Error verifying OTP" });
    }
};

// Controller for testing email connection
export const testEmailConnection = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.verify();
        res.status(200).json({ message: "Email connection successful" });
    } catch (error) {
        console.error("Email connection error:", error);
        res.status(500).json({ message: "Error connecting to email service", error: error.message });
    }
};