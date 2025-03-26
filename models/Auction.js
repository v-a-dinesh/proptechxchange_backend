// models/Auction.js

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
  },
  propertyDetails: {
    title: { type: String },
    propertyType: { type: String },
    size: {
      value: { type: Number },
      unit: { type: String },
    },
    address: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    images: [
      {
        url: { type: String },
        description: { type: String },
      },
    ],
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