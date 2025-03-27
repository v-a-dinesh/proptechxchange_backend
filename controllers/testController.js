export const testFirebaseUID = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Extract UID from decoded token
    const firebaseUID = req.user.uid;

    res.json({ success: true, firebaseUID });
  } catch (error) {
    console.error("Error extracting Firebase UID:", error);
    res.status(500).json({ success: false, message: "Server error extracting UID" });
  }
};
