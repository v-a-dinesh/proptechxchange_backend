import express from 'express';
import { sendVerificationOTP, verifyOTP, testEmailConnection } from '../controllers/otpController.js';

const router = express.Router();

router.post('/send-otp', sendVerificationOTP);
router.post('/verify-otp', verifyOTP);
router.get('/test-email', testEmailConnection);

export default router;