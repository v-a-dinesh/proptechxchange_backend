import Property from "../models/Property.js";

/**
 * @route   POST /api/properties
 * @desc    Seller adds a new property
 * @access  Private (Seller only)
 */
export const addProperty = async (req, res) => {
  try {
    const sellerId = req.user.uid; // ✅ Extract from authenticated user
    const { title, description, propertyType, size, address, images, videos } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const newProperty = new Property({
      sellerId, // ✅ Use Firebase user ID
      title,
      description,
      propertyType,
      size,
      address,
      images,
      videos,
    });

    await newProperty.save();
    res.status(201).json({ success: true, message: "Property added successfully", property: newProperty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding property", error: error.message });
  }
};

/**
 * @route   GET /api/properties/seller/:sellerId
 * @desc    Get all properties of a specific seller
 * @access  Private (Seller only)
 */
export const getSellerProperties = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const properties = await Property.find({ sellerId });

        res.status(200).json({ success: true, properties });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching properties.", error: error.message });
    }
};

/**
 * @route   GET /api/properties/:propertyId
 * @desc    Get details of a specific property
 * @access  Private (Seller only)
 */
export const getSingleProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ success: false, message: "Property not found." });

        res.status(200).json({ success: true, property });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching property.", error: error.message });
    }
};

/**
 * @route   PUT /api/properties/:propertyId
 * @desc    Seller updates a property
 * @access  Private (Seller only)
 */
export const updateProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const updates = req.body;

        const updatedProperty = await Property.findByIdAndUpdate(propertyId, updates, { new: true });
        if (!updatedProperty) return res.status(404).json({ success: false, message: "Property not found." });

        res.status(200).json({ success: true, message: "Property updated successfully.", property: updatedProperty });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating property.", error: error.message });
    }
};

/**
 * @route   DELETE /api/properties/:propertyId
 * @desc    Seller deletes a property
 * @access  Private (Seller only)
 */
export const deleteProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;

        const deletedProperty = await Property.findByIdAndDelete(propertyId);
        if (!deletedProperty) return res.status(404).json({ success: false, message: "Property not found." });

        res.status(200).json({ success: true, message: "Property deleted successfully." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting property.", error: error.message });
    }
};
