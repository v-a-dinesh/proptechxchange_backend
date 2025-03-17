import express from 'express';
import otpRoutes from './otpRoutes.js';

const router = express.Router();

router.use('/otp', otpRoutes);

export default router;