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
