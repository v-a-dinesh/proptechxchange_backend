import express from "express";
import admin from "../config/firebaseAdmin.js";

const router = express.Router();

// Generate Firebase Custom Token for a User
router.post("/generate-token", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: "User UID is required" });
    }

    // Generate Firebase ID Token
    const customToken = await admin.auth().createCustomToken(uid);

    res.status(200).json({ success: true, token: customToken });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating token", error: error.message });
  }
});

export default router;
