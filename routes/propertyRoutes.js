import express from "express";
import { 
    addProperty, 
    getSellerProperties, 
    getSingleProperty,
    updateProperty, 
    deleteProperty 
} from "../controllers/propertyController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Seller adds a property
router.post("/add", verifyToken, addProperty);

// ✅ Seller gets all their properties
router.get("/getall/:sellerId", verifyToken, getSellerProperties);

// ✅ Get details of a single property
router.get("/get/:propertyId", verifyToken, getSingleProperty);

// ✅ Seller updates a property
router.put("/update/:propertyId", verifyToken, updateProperty);

// ✅ Seller deletes a property
router.delete("/delete/:propertyId", verifyToken, deleteProperty);

export default router;
