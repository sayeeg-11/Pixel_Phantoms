/**
 * Sample Express Server with Global Error Handling
 * 
 * This file demonstrates how to integrate the errorMiddleware.js
 * into your Express application for centralized error handling.
 * 
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  ApiError 
} = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

function getCorsOrigin() {
  const originsEnv = process.env.CORS_ORIGINS;

  if (!originsEnv) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CORS_ORIGINS environment variable must be set in production when credentials are enabled.');
    }
    // In non-production environments, allow all origins for convenience.
    return '*';
  }

  return originsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

const corsOrigin = getCorsOrigin();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const env = process.env.NODE_ENV || 'development';

    // If specific origins are configured, only allow those
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS configuration'), false);
    }

    // No CORS_ORIGINS configured: in development, allow all; otherwise, fail closed
    if (env === 'development') {
      return callback(null, true);
    }

    return callback(new Error('CORS_ORIGINS must be set in production environments'), false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

// Example routes demonstrating error handling

// 1. Synchronous error example
app.get('/api/sync-error', (req, res) => {
  // This will be caught by the error middleware
  throw new ApiError(400, 'This is a synchronous error example');
});

// 2. Async error example using asyncHandler
app.get('/api/async-error', asyncHandler(async (req, res) => {
  // Simulate an async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  // This will be caught by asyncHandler and passed to error middleware
  throw new ApiError(500, 'This is an async error example');
}));

// 3. Validation error example
app.post('/api/validate', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const errors = [];
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });
  
  if (errors.length > 0) {
    throw new ApiError(422, 'Validation failed', errors);
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'Validation passed' 
  });
}));

// 4. Database error simulation
app.get('/api/database-error', asyncHandler(async (req, res) => {
  // Simulate a database connection error
  throw new ApiError(503, 'Database connection failed', [
    { code: 'DB_CONNECTION_ERROR', message: 'Unable to connect to database' }
  ]);
}));

// 5. Successful response example
app.get('/api/success', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Request successful',
    data: { 
      user: 'John Doe',
      role: 'admin' 
    }
  });
});

// Sample API routes (add your routes here)
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);

// 404 Handler - Must be placed after all other routes
app.use(notFoundHandler);

// Global Error Handler - Must be the last middleware
app.use(errorHandler);

// Start server
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Failed to start server: Port ${PORT} is already in use.`);
    } else if (error.code === 'EACCES') {
      console.error(`Failed to start server: Insufficient privileges to bind to port ${PORT}.`);
    } else {
      console.error('Failed to start server due to an unexpected error:', error);
    }
    process.exit(1);
  });
}

module.exports = app;
