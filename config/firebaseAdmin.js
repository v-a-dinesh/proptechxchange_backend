import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Get absolute path to the service account key
const serviceAccountPath = path.resolve("config/firebaseServiceAccount.json");

// Ensure the file exists
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("Firebase service account key file is missing!");
}

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  // Load the service account key
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
