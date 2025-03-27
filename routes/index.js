import express from 'express';
import otpRoutes from './otpRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import auctionRoutes from './auctionRoutes.js';
import idRoutes from './idRoutes.js';
import buyerRoutes from "./buyerRoutes.js";
const router = express.Router();

router.use('/otp', otpRoutes);
router.use('/properties', propertyRoutes);
router.use('/auctions', auctionRoutes);
router.use('/auth', idRoutes);
router.use("/buyer", buyerRoutes);

export default router;
