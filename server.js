import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mainRoutes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use main routes
app.use('/api', mainRoutes);

// Error handling middleware
app.use(errorHandler);

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 PropTechXchange API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
