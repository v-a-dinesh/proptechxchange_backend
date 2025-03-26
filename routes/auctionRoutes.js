import express from "express";
import { 
    startAuction, 
    getSellerAuctions, 
    getSingleAuction, 
    closeAuction, 
    placeBid
} from "../controllers/auctionController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Seller starts an auction
router.post("/add", verifyToken, startAuction);

// ✅ Seller fetches all their auctions
router.get("/getall/:sellerId", verifyToken, getSellerAuctions);

// ✅ Get details of a single auction
router.get("/get/:auctionId", verifyToken, getSingleAuction);

// ✅ Buyer places a bid
router.put("/bid/:auctionId", verifyToken, placeBid);

// ✅ Seller closes an auction
router.put("/close/:auctionId", verifyToken, closeAuction);

export default router;
