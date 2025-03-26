import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AuctionSchema = new Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  sellerId: {
    type: String, // Firebase UID of the seller
    required: true,
    ref: "User",
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["upcoming", "active", "extended", "completed", "cancelled"],
    default: "upcoming",
  },
  basePrice: { type: Number, required: true },
  currentHighestBid: {
    amount: { type: Number, default: 0 },
    bidder: { type: String, ref: "User" },
    timestamp: { type: Date },
  },
  bids: [
    {
      bidder: { type: String, ref: "User", required: true },
      amount: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      isAutoBid: { type: Boolean, default: false },
    },
  ],
  transaction: {
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentId: { type: String },
    paymentMethod: { type: String },
    amount: { type: Number },
    timestamp: { type: Date },
    invoice: { type: String }, // URL to invoice
  },
}, { timestamps: true });

// Create indexes
AuctionSchema.index({ propertyId: 1 });
AuctionSchema.index({ sellerId: 1 });
AuctionSchema.index({ status: 1 });
AuctionSchema.index({ endTime: 1 });
AuctionSchema.index({ "currentHighestBid.amount": 1 });

const Auction = mongoose.model("Auction", AuctionSchema);
export default Auction;
