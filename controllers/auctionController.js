import Auction from "../models/Auction.js";
import Property from "../models/Property.js";

// /**
//  * @route   POST /api/auctions
//  * @desc    Seller starts an auction
//  * @access  Private (Seller only)
//  */
// export const startAuction = async (req, res) => {
//     try {
//         const { sellerId, propertyId, basePrice, startTime, endTime } = req.body;

//         if (!sellerId || !propertyId || !basePrice || !startTime || !endTime) {
//             return res.status(400).json({ success: false, message: "All fields are required." });
//         }

//         // Check if the property exists
//         const property = await Property.findById(propertyId);
//         if (!property) return res.status(404).json({ success: false, message: "Property not found." });

//         const newAuction = new Auction({
//             sellerId,
//             propertyId,
//             basePrice,
//             startTime,
//             endTime
//         });

//         await newAuction.save();
//         res.status(201).json({ success: true, message: "Auction started successfully.", auction: newAuction });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error starting auction.", error: error.message });
//     }
// };

/**
 * @route   GET /api/auctions/seller/:sellerId
 * @desc    Get all auctions of a specific seller
 * @access  Private (Seller only)
 */

// controllers/auctionController.js



// controllers/auctionController.js


/**
 * @route   POST /api/auctions
 * @desc    Seller starts an auction
 * @access  Private (Seller only)
 */
export const startAuction = async (req, res) => {
  try {
    const { sellerId, propertyId, basePrice, startTime, endTime } = req.body;

    if (!sellerId || !propertyId || !basePrice || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Check if the property exists and fetch additional details
    const property = await Property.findById(propertyId).select('title propertyType size address images');
    if (!property) return res.status(404).json({ success: false, message: "Property not found." });

    const newAuction = new Auction({
      sellerId,
      propertyId,
      basePrice,
      startTime,
      endTime,
      status: "active",
      propertyDetails: {
        title: property.title,
        propertyType: property.propertyType,
        size: property.size,
        address: property.address,
        images: property.images.map(img => ({ url: img.url, description: img.description }))
      }
    });

    await newAuction.save();

    // Update property status to 'in_auction'
    await Property.findByIdAndUpdate(propertyId, { status: 'in_auction' });

    // Prepare the response
    const response = {
      success: true,
      message: "Auction started successfully.",
      auction: newAuction.toObject({ versionKey: false })
    };

    // Remove unnecessary fields from the response
    delete response.auction.currentHighestBid.bidder;
    delete response.auction.currentHighestBid.timestamp;
    delete response.auction.transaction.paymentId;
    delete response.auction.transaction.paymentMethod;
    delete response.auction.transaction.amount;
    delete response.auction.transaction.timestamp;
    delete response.auction.transaction.invoice;
    delete response.auction.__v;

    res.status(201).json(response);

  } catch (error) {
    res.status(500).json({ success: false, message: "Error starting auction.", error: error.message });
  }
};
export const getSellerAuctions = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const auctions = await Auction.find({ sellerId });

        res.status(200).json({ success: true, auctions });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching auctions.", error: error.message });
    }
};

/**
 * @route   GET /api/auctions/:auctionId
 * @desc    Get details of a specific auction
 * @access  Private
 */
export const getSingleAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId).populate("propertyId");
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });

        res.status(200).json({ success: true, auction });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching auction.", error: error.message });
    }
};

/**
 * @route   PUT /api/auctions/:auctionId/close
 * @desc    Seller closes an auction
 * @access  Private (Seller only)
 */
export const closeAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findByIdAndUpdate(auctionId, { status: "completed" }, { new: true });
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });

        res.status(200).json({ success: true, message: "Auction closed successfully.", auction });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error closing auction.", error: error.message });
    }
};

/**
 * @route   PUT /api/auctions/:auctionId/bid
 * @desc    Buyer places a bid
 * @access  Private (Buyer only)
 */
export const placeBid = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { bidder, amount, isAutoBid } = req.body;

        if (!bidder || !amount) {
            return res.status(400).json({ success: false, message: "Bidder and amount are required." });
        }

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });

        if (new Date() > new Date(auction.endTime)) {
            return res.status(400).json({ success: false, message: "Auction has ended." });
        }

        if (amount <= auction.currentHighestBid.amount) {
            return res.status(400).json({ success: false, message: "Bid must be higher than the current highest bid." });
        }

        // Update auction with new highest bid
        auction.currentHighestBid = { amount, bidder, timestamp: new Date() };
        auction.bids.push({ bidder, amount, timestamp: new Date(), isAutoBid });

        await auction.save();

        res.status(200).json({ success: true, message: "Bid placed successfully.", auction });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error placing bid.", error: error.message });
    }
};
