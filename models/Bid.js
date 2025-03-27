// models/Bid.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BidSchema = new Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    bidderId: {
      type: String, // Firebase UID of the buyer
      required: true,
      ref: "User",
    },
    amount: { type: Number, required: true },
    isAutoBid: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for faster queries
BidSchema.index({ auctionId: 1 });
BidSchema.index({ bidderId: 1 });

const Bid = mongoose.model("Bid", BidSchema);
export default Bid;
