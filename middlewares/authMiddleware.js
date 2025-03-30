import admin from "firebase-admin";
import serviceAccount from "../config/firebaseServiceAccount.js";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized, token missing" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach Firebase user data to request
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized, invalid token" });
  }
};



export const verifyAdmin = async (req, res, next) => {
    try {

        if (!req.user) {
            return res.status(403).json({ success: false, message: "Unauthorized: No user data found." });
        }

        let role = req.user.role;

        // If role is missing in token, fetch from Firestore
        if (!role) {
            const userDoc = await admin.firestore().collection("users").doc(req.user.uid).get();
            role = userDoc.exists ? userDoc.data().role : null;
        }

        if (role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error verifying admin role.", error: error.message });
    }
};
