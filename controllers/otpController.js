import OTP from '../models/OTP.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Function to generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to send OTP via email
const sendOTP = async (email, otp, displayName) => {
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
      subject: "Verify Your PropTechXchange Account - One-Time Password (OTP)",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4a90e2;
            color: white;
            text-align: center;
            padding: 20px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f4f4f4;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .otp {
            background-color: #ffffff;
            border: 2px dashed #4a90e2;
            text-align: center;
            padding: 15px;
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .contact-info {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PropTechXchange</h1>
        <p>Secure Account Verification</p>
    </div>
    
    <div class="content">
        <h2>Hello ${displayName},</h2>
        
        <p>You are just one step away from accessing your PropTechXchange account. To complete your registration, please use the One-Time Password (OTP) below:</p>
        
        <div class="otp">
            ${otp}
        </div>
        
        <p><strong>Important Details:</strong></p>
        <ul>
            <li>This OTP is valid for 10 minutes</li>
            <li>Do not share this OTP with anyone</li>
            <li>This is an automated message, please do not reply</li>
        </ul>
        
        <div class="contact-info">
            <h3>Need Help?</h3>
            <p>Contact our support team:</p>
            <p>
                General Inquiries: <a href="mailto:proptechxchange@gmail.com">proptechxchange@gmail.com</a><br>
                Manager:<a href="mailto:managerproptechxchange@gmail.com">managerproptechxchange@gmail.com</a><br>
                Customer Support: <a href="tel:+918985921962">+91 8985921962</a>
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>&copy; 2025 PropTechXchange. All rights reserved.</p>
        <p>Transforming Real Estate Transactions</p>
    </div>
</body>
</html>
    `,
    });
};

// Controller for sending OTP
export const sendVerificationOTP = async (req, res) => {
    try {
        const { email, displayName } = req.body;
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        await OTP.findOneAndUpdate(
            { email },
            { email, otp, expiresAt },
            { upsert: true, new: true }
        );

        await sendOTP(email, otp, displayName);

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