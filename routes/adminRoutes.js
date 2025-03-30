import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import {
  approveAuction,
  rejectAuction,
  getAllProperties,
  getSingleProperty,
  deleteProperty,
  getAllAuctions,
  getSingleAuction,
  deleteAuction,
  getAllBids,
  getSingleBid,
  deleteBid,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getAdminDashboardStats,
  createUser 
} from "../controllers/adminController.js";

const router = express.Router();

// 🔹 Auction Management
router.put("/auctions/approve/:auctionId", verifyToken, verifyAdmin, approveAuction);
router.put("/auctions/reject/:auctionId", verifyToken, verifyAdmin, rejectAuction);
router.get("/auctions", verifyToken, verifyAdmin, getAllAuctions);
router.get("/auctions/:auctionId", verifyToken, verifyAdmin, getSingleAuction);
router.delete("/auctions/:auctionId", verifyToken, verifyAdmin, deleteAuction);

// 🔹 Property Management
router.get("/properties", verifyToken, verifyAdmin, getAllProperties);
router.get("/properties/:propertyId", verifyToken, verifyAdmin, getSingleProperty);
router.delete("/properties/:propertyId", verifyToken, verifyAdmin, deleteProperty);

// 🔹 Bidding Management
router.get("/bids", verifyToken, verifyAdmin, getAllBids);
router.get("/bids/:bidId", verifyToken, verifyAdmin, getSingleBid);
router.delete("/bids/:bidId", verifyToken, verifyAdmin, deleteBid);

// 🔹 User Management
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/users/:userId", verifyToken, verifyAdmin, getSingleUser);
router.put("/users/:userId", verifyToken, verifyAdmin, updateUser);
router.delete("/users/:userId", verifyToken, verifyAdmin, deleteUser);
router.post("/create/users", verifyToken, verifyAdmin, createUser);

// 🔹 Admin Dashboard Statistics
router.get("/dashboard/stats", verifyToken, verifyAdmin, getAdminDashboardStats);

export default router;
