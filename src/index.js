import express from 'express';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js'; // Must include .js extension
import authRoutes from './routes/authRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware to parse JSON request bodies (required for the registration API)
app.use(express.json());

// Register Authentication Routes
app.use('/api/v1/auth', authRoutes);

/**
 * Initialize Database and Start Server
 */
const startServer = async () => {
    try {
        // 1. Connect to PostgreSQL
        await connectDB();
        
        // 2. Sync Sequelize models with the database
        // This creates the 'Users' table automatically if it doesn't exist
        await sequelize.sync(); 
        console.log('✅ Database tables synced successfully.');

        // 3. Start Listening
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Server failed to start due to database error:', error);
        process.exit(1); // Exit with failure
    }
};

startServer();