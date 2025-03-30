import Auction from "../models/Auction.js";
import Property from "../models/Property.js";
import Bid from "../models/Bid.js";
import admin from "firebase-admin";

// Initialize Firestore
const db = admin.firestore();
const usersCollection = db.collection("users");

import mongoose from "mongoose";
/** 
 * 🏆 Approve Auction 
 * @route PUT /admin/auctions/approve/:auctionId
 */
export const approveAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });

        auction.status = "active";
        await auction.save();

        res.status(200).json({ success: true, message: "Auction approved successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error approving auction.", error: error.message });
    }
};

/** 
 * ❌ Reject Auction 
 * @route PUT /admin/auctions/reject/:auctionId
 */
export const rejectAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });

        auction.status = "cancelled";
        await auction.save();

        res.status(200).json({ success: true, message: "Auction rejected successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error rejecting auction.", error: error.message });
    }
};

/** 
 * 🔍 Get All Auctions 
 * @route GET /admin/auctions
 */
export const getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate("propertyId");

        // Fetch seller details from Firebase for each auction
        const sellerIds = [...new Set(auctions.map(auction => auction.sellerId))];
        const sellers = await Promise.all(sellerIds.map(async (uid) => {
            try {
                const user = await admin.auth().getUser(uid);
                return { uid, name: user.displayName || "N/A", email: user.email };
            } catch {
                return { uid, name: "Unknown", email: "Unknown" };
            }
        }));

        const auctionsWithSeller = auctions.map(auction => ({
            ...auction.toObject(),
            seller: sellers.find(s => s.uid === auction.sellerId)
        }));

        res.status(200).json({ success: true, auctions: auctionsWithSeller });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching auctions.", error: error.message });
    }
};

/** 
 * 🔍 Get Single Auction Details 
 * @route GET /admin/auctions/:auctionId
 */
export const getSingleAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const auction = await Auction.findById(auctionId).populate("propertyId");

        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });

        // Fetch seller details from Firebase
        let seller = { name: "Unknown", email: "Unknown" };
        try {
            const user = await admin.auth().getUser(auction.sellerId);
            seller = { name: user.displayName || "N/A", email: user.email };
        } catch (error) {}

        res.status(200).json({ success: true, auction: { ...auction.toObject(), seller } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching auction.", error: error.message });
    }
};


/** 
 * ❌ Delete Auction 
 * @route DELETE /admin/auctions/:auctionId
 */
export const deleteAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        await Auction.findByIdAndDelete(auctionId);
        res.status(200).json({ success: true, message: "Auction deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting auction.", error: error.message });
    }
};

/** 
 * 🔍 Get All Properties 
 * @route GET /admin/properties
 */
export const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find();

        // Fetch seller details from Firebase
        const sellerIds = [...new Set(properties.map(prop => prop.sellerId))];
        const sellers = await Promise.all(sellerIds.map(async (uid) => {
            try {
                const user = await admin.auth().getUser(uid);
                return { uid, name: user.displayName || "N/A", email: user.email };
            } catch {
                return { uid, name: "Unknown", email: "Unknown" };
            }
        }));

        const propertiesWithSeller = properties.map(prop => ({
            ...prop.toObject(),
            seller: sellers.find(s => s.uid === prop.sellerId)
        }));

        res.status(200).json({ success: true, properties: propertiesWithSeller });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching properties.", error: error.message });
    }
};


/** 
 * 🔍 Get Single Property 
 * @route GET /admin/properties/:propertyId
 */
export const getSingleProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const property = await Property.findById(propertyId);

        if (!property) return res.status(404).json({ success: false, message: "Property not found." });

        // Fetch seller details from Firebase
        let seller = { name: "Unknown", email: "Unknown" };
        try {
            const user = await admin.auth().getUser(property.sellerId);
            seller = { name: user.displayName || "N/A", email: user.email };
        } catch (error) {}

        res.status(200).json({ success: true, property: { ...property.toObject(), seller } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching property.", error: error.message });
    }
};


/** 
 * ❌ Delete Property 
 * @route DELETE /admin/properties/:propertyId
 */
export const deleteProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        await Property.findByIdAndDelete(propertyId);
        res.status(200).json({ success: true, message: "Property deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting property.", error: error.message });
    }
};

/** 
 * 🔍 Get All Bids 
 * @route GET /admin/bids
 */


export const getAllBids = async (req, res) => {
    try {
        const bids = await Bid.find().populate("auctionId");

        // Fetch related auction and property details
        const bidsWithDetails = await Promise.all(
            bids.map(async (bid) => {
                let auction = await Auction.findById(bid.auctionId).populate("propertyId");
                
                return {
                    ...bid.toObject(),
                    auction,
                    property: auction ? auction.propertyId : null, // Extract property from auction
                };
            })
        );

        // Fetch bidder details from Firebase
        const bidderIds = [...new Set(bids.map(bid => bid.bidderId))];
        const bidders = await Promise.all(
            bidderIds.map(async (uid) => {
                try {
                    const user = await admin.auth().getUser(uid);
                    return { uid, name: user.displayName || "N/A", email: user.email };
                } catch {
                    return { uid, name: "Unknown", email: "Unknown" };
                }
            })
        );

        const finalBids = bidsWithDetails.map(bid => ({
            ...bid,
            bidder: bidders.find(b => b.uid === bid.bidderId),
        }));

        res.status(200).json({ success: true, bids: finalBids });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching bids.", error: error.message });
    }
};


/** 
 * 🔍 Get Single Bid 
 * @route GET /admin/bids/:bidId
 */
export const getSingleBid = async (req, res) => {
    try {
        const { bidId } = req.params;
        const bid = await Bid.findById(bidId).populate("auctionId");

        if (!bid) return res.status(404).json({ success: false, message: "Bid not found." });

        let auction = await Auction.findById(bid.auctionId).populate("propertyId");

        // Fetch bidder details from Firebase
        let bidder = { name: "Unknown", email: "Unknown" };
        try {
            const user = await admin.auth().getUser(bid.bidderId);
            bidder = { name: user.displayName || "N/A", email: user.email };
        } catch (error) {}

        res.status(200).json({
            success: true,
            bid: { 
                ...bid.toObject(), 
                auction, 
                property: auction ? auction.propertyId : null, 
                bidder
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching bid.", error: error.message });
    }
};



/** 
 * ❌ Delete Bid 
 * @route DELETE /admin/bids/:bidId
 */
export const deleteBid = async (req, res) => {
    try {
        const { bidId } = req.params;
        await Bid.findByIdAndDelete(bidId);
        res.status(200).json({ success: true, message: "Bid deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting bid.", error: error.message });
    }
};

/** 
 * 🔍 Get All Users 
 * @route GET /admin/users
 */
export const getAllUsers = async (req, res) => {
    try {
        const usersSnapshot = await usersCollection.get();
        const users = [];

        usersSnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users.", error: error.message });
    }
};


/** 
 * 🔍 Get Single User 
 * @route GET /admin/users/:userId
 */
export const getSingleUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user from Firebase Authentication
        const userRecord = await admin.auth().getUser(userId);

        // Fetch user data from Firestore
        const userDoc = await usersCollection.doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: "User not found in Firestore." });
        }

        const user = { 
            uid: userRecord.uid, 
            email: userRecord.email, 
            name: userRecord.displayName || "N/A", 
            role: userRecord.customClaims?.role || "buyer",
            ...userDoc.data() // Include Firestore data
        };

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(404).json({ success: false, message: "User not found.", error: error.message });
    }
};


/** 
 * ✏️ Update User Role 
 * @route PUT /admin/users/:userId
 */
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["buyer", "seller", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role specified." });
        }

        // Update role in Firebase Authentication
        await admin.auth().setCustomUserClaims(userId, { role });

        // Update role in Firestore
        await usersCollection.doc(userId).update({ role });

        res.status(200).json({ success: true, message: `User role updated to ${role}.` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user role.", error: error.message });
    }
};




/** 
 * 🗑️ Delete a User 
 * @route DELETE /admin/users/:userId
 */
export const deleteUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId } = req.params;

        // Check if user exists in Firestore
        const userDoc = await usersCollection.doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: "User not found in Firestore." });
        }

        // Attempt to fetch user from Firebase Authentication
        let userRecord;
        try {
            userRecord = await admin.auth().getUser(userId);
        } catch (authError) {
        }

        // If user exists in Firebase Authentication, delete from Auth
        if (userRecord) {
            await admin.auth().deleteUser(userId);
        }

        // Delete related data based on role
        const role = userDoc.data().role || "buyer";
        if (role === "seller") {
            await Property.deleteMany({ sellerId: userId }).session(session);
            await Auction.deleteMany({ sellerId: userId }).session(session);
        }
        if (role === "buyer") {
            await Bid.deleteMany({ buyerId: userId }).session(session);
        }

        // Delete user from Firestore
        await usersCollection.doc(userId).delete();

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: "User deleted successfully from Firestore and Firebase Authentication." });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error deleting user:", error.message);
        res.status(500).json({ success: false, message: "Error deleting user.", error: error.message });
    }
};
export const createUser = async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body;

        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({ 
            email, 
            password, 
            displayName 
        });

        // Assign custom role in Firebase Auth
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: role || "buyer" });

        // Get the current timestamp
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        // Store user in Firestore in the required format
        await usersCollection.doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            displayName: displayName || "N/A",
            role: role || "buyer",
            createdAt: timestamp,
            lastLogin: timestamp // Initial login timestamp is the same as creation
        });

        res.status(201).json({ 
            success: true, 
            message: "User created successfully.", 
            uid: userRecord.uid 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error creating user.", 
            error: error.message 
        });
    }
};

/** 
 * 📊 Admin Dashboard Stats 
 * @route GET /admin/dashboard
 */
export const getAdminDashboardStats = async (req, res) => {
    try {
        // Get user counts from Firebase
        const listUsers = await admin.auth().listUsers();
        const totalUsers = listUsers.users.length;
        
        // Count users by role
        let totalSellers = 0;
        let totalBuyers = 0;
        
        listUsers.users.forEach(user => {
            const role = user.customClaims?.role || "buyer";
            if (role === "seller") totalSellers++;
            if (role === "buyer") totalBuyers++;
        });

        // 📌 Count total properties & group them by property type
        const propertyStats = await Property.aggregate([
            { $group: { _id: "$propertyType", count: { $sum: 1 } } }
        ]);

        // 📌 Count total auctions & categorize them by base price ranges
        const auctionStats = await Auction.aggregate([
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ["$basePrice", 50000] }, then: "Below 50K" },
                                { case: { $lt: ["$basePrice", 100000] }, then: "50K - 100K" },
                                { case: { $lt: ["$basePrice", 500000] }, then: "100K - 500K" }
                            ],
                            default: "Above 500K"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 📌 Count total bids & categorize them by highest bid price ranges
        const bidStats = await Bid.aggregate([
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ["$bidAmount", 50000] }, then: "Below 50K" },
                                { case: { $lt: ["$bidAmount", 100000] }, then: "50K - 100K" },
                                { case: { $lt: ["$bidAmount", 500000] }, then: "100K - 500K" }
                            ],
                            default: "Above 500K"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // ✅ Send response
        res.status(200).json({
            success: true,
            statistics: {
                users: { totalUsers, totalSellers, totalBuyers },
                properties: propertyStats,
                auctions: auctionStats,
                bids: bidStats
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dashboard stats.", error: error.message });
    }
};