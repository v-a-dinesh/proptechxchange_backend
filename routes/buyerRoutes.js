import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAllActiveAuctions,
  getUpcomingAuctions,
  getSingleAuctionDetails,
  placeBid,
  getWonAuctions,
  getAllProperties,
  searchProperties,
  filterProperties,
  getAllBids,
  getBidById,
  updateBid,
  deleteBid,
  getBidHistory,
} from "../controllers/buyerController.js";
import { testFirebaseUID } from "../controllers/testController.js";
const router = express.Router();

// 🔹 Auction Routes
router.get("/auctions", verifyToken, getAllActiveAuctions);
router.get("/auctions/active", verifyToken, getAllActiveAuctions);
router.get("/auctions/upcoming", verifyToken, getUpcomingAuctions);
router.get("/auctions/:auctionId", verifyToken, getSingleAuctionDetails);
router.put("/auctions/:auctionId/bid", verifyToken, placeBid);

router.get("/auctions/won", verifyToken, getWonAuctions);

// 🔹 Property Routes
router.get("/properties", verifyToken, getAllProperties);
router.get("/properties/search", verifyToken, searchProperties);
router.get("/properties/filter", verifyToken, filterProperties);

// 🔹 Bidding Routes
router.get("/bids", verifyToken, getAllBids); // View all bids
router.get("/bids/:bidId", verifyToken, getBidById); // View a specific bid
router.put("/bids/:bidId", verifyToken, updateBid); // Update bid amount
router.delete("/bids/:bidId", verifyToken, deleteBid); // Delete a bid
router.get("/buyerbidhistory", verifyToken, getBidHistory);


router.get("/test", verifyToken, testFirebaseUID);

export default router;
