import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PropertySchema = new Schema(
  {
    sellerId: {
      type: String, // Firebase UID of the seller
      required: true,
      ref: "User",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      required: true,
      enum: ["Apartment", "House", "Commercial", "Land", "Other"],
    },
    size: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        required: true,
        enum: ["sqft", "sqm", "acres", "hectares"],
      },
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
        url: { type: String, required: true }, // Image URL (Firebase Storage, Cloudinary, etc.)
        description: { type: String, default: "" }, // Optional image description
      },
    ],
    videos: [
      {
        url: { type: String, required: true }, // Video URL (YouTube, Firebase Storage, etc.)
        thumbnail: { type: String }, // Optional thumbnail URL
        description: { type: String, default: "" }, // Optional video description
      },
    ],
    status: {
      type: String,
      enum: ["pending_approval", "approved", "in_auction", "sold", "delisted"],
      default: "pending_approval",
    },
  },
  { timestamps: true }
);

// ✅ Add 2dsphere index for location-based queries


const Property = mongoose.model("Property", PropertySchema);
export default Property;
