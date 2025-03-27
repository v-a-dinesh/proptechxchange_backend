// controllers/buyerController.js
import Auction from "../models/Auction.js";
import Property from "../models/Property.js";
import Bid from "../models/Bid.js";
import admin from "firebase-admin";

// ✅ Get All Active Auctions
export const getAllActiveAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "active" }).populate("propertyId");
    res.json({ success: true, data: auctions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Upcoming Auctions
export const getUpcomingAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "upcoming" }).populate("propertyId");
    res.json({ success: true, data: auctions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Single Auction Details
export const getSingleAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate("propertyId");
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });

    res.json({ success: true, data: auction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/buyerController.js

// ... (other imports and functions remain the same)

// ✅ Place a Bid
export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const { auctionId } = req.params;
    const bidderId = req.user.uid; // Firebase UID from verifyToken middleware

    console.log('Placing bid:', { auctionId, bidderId, amount });

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "active") {
      console.log('Invalid auction or not active:', auction);
      return res.status(400).json({ success: false, message: "Invalid auction or not active" });
    }

    if (amount <= auction.currentHighestBid.amount) {
      console.log('Bid amount too low:', { bidAmount: amount, currentHighestBid: auction.currentHighestBid.amount });
      return res.status(400).json({ success: false, message: "Bid must be higher than the current highest bid" });
    }

    // Save the bid
    const bid = new Bid({ auctionId, bidderId, amount });
    await bid.save();

    // Update auction's highest bid
    auction.currentHighestBid.amount = amount;
    auction.bids.push({ bidder: bidderId, amount, timestamp: new Date() });
    await auction.save();

    console.log('Bid placed successfully:', bid);
    res.json({ success: true, message: "Bid placed successfully", data: { bidId: bid._id, amount: bid.amount } });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ... (other functions remain the same)


// ✅ Get Won Auctions
export const getWonAuctions = async (req, res) => {
  try {
    const buyerId = req.user.uid;
    const wonAuctions = await Auction.find({ "winner.bidderId": buyerId }).populate("propertyId");
    res.json({ success: true, data: wonAuctions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get All Properties
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: { $ne: "in_auction" } });
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Search Properties
// ✅ Search Properties (Keyword-based)
export const searchProperties = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    const properties = await Property.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { propertyType: { $regex: keyword, $options: "i" } },
        { "address.address": { $regex: keyword, $options: "i" } },
        { "address.city": { $regex: keyword, $options: "i" } },
        { "address.state": { $regex: keyword, $options: "i" } },
        { "address.country": { $regex: keyword, $options: "i" } },
        { "address.zipCode": { $regex: keyword, $options: "i" } }
      ],
    });

    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Filter Properties (Multi-field)
export const filterProperties = async (req, res) => {
  try {
    const { title, propertyType, size, address } = req.query;
    const filter = {};

    // Apply filters based on query parameters
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    if (propertyType) {
      filter.propertyType = { $regex: propertyType, $options: "i" };
    }
    if (size) {
      filter["size.value"] = { $gte: Number(size) }; // Filters size greater than or equal to given value
    }
    if (address) {
      filter.$or = [
        { "address.address": { $regex: address, $options: "i" } },
        { "address.city": { $regex: address, $options: "i" } },
        { "address.state": { $regex: address, $options: "i" } },
        { "address.country": { $regex: address, $options: "i" } },
        { "address.zipCode": { $regex: address, $options: "i" } }
      ];
    }

    const properties = await Property.find(filter);
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get All Bids (Admin Use or Buyer Self)
export const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find().populate("auctionId");
    res.json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Particular Bid by ID
export const getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate("auctionId");
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });

    res.json({ success: true, data: bid });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Bid Amount
export const updateBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const { bidId } = req.params;
    const bidderId = req.user.uid;

    const bid = await Bid.findById(bidId);
    if (!bid || bid.bidderId !== bidderId) {
      return res.status(403).json({ success: false, message: "Unauthorized or bid not found" });
    }

    // Check if auction is still active
    const auction = await Auction.findById(bid.auctionId);
    if (!auction || auction.status !== "active") {
      return res.status(400).json({ success: false, message: "Auction is not active" });
    }

    if (amount <= auction.currentHighestBid.amount) {
      return res.status(400).json({ success: false, message: "Bid must be higher than the current highest bid" });
    }

    bid.amount = amount;
    await bid.save();

    // Update auction's highest bid
    auction.currentHighestBid.amount = amount;
    await auction.save();

    res.json({ success: true, message: "Bid updated successfully", data: bid });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete a Bid
export const deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const bidderId = req.user.uid;

    const bid = await Bid.findById(bidId);
    if (!bid || bid.bidderId !== bidderId) {
      return res.status(403).json({ success: false, message: "Unauthorized or bid not found" });
    }

    await Bid.findByIdAndDelete(bidId);
    res.json({ success: true, message: "Bid deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get Buyer's Bid History
export const getBidHistory = async (req, res) => {
  try {
    const bidderId = req.user.uid;

    const bidHistory = await Bid.find({ bidderId })
      .populate({
        path: "auctionId",
        populate: {
          path: "propertyId",
          select: "title propertyType address images", // Include 'images' array
        },
      })
      .sort({ timestamp: -1 });

    // Transform the bid history response
    const formattedBidHistory = bidHistory.map((bid) => ({
      bidId: bid._id,
      auctionId: bid.auctionId?._id,
      propertyTitle: bid.auctionId?.propertyId?.title,
      propertyType: bid.auctionId?.propertyId?.propertyType,
      propertyAddress: bid.auctionId?.propertyId?.address,
      propertyImage:
        bid.auctionId?.propertyId?.images?.[0]?.url || "No image available", // Get the first image
      bidAmount: bid.amount,
      bidTimestamp: bid.timestamp,
      isAutoBid: bid.isAutoBid,
      auctionStatus: bid.auctionId?.status,
    }));

    res.json({
      success: true,
      data: formattedBidHistory,
      totalBids: formattedBidHistory.length,
    });
  } catch (error) {
    console.error("Error retrieving bid history:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving bid history",
    });
  }
};
