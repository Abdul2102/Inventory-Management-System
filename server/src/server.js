const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().catch((err) => {
  console.error('Initial database connection attempt failed:', err.message);
});

const app = express();

// Secure CORS configuration
const getOrigin = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url.trim());
    return parsed.origin;
  } catch (e) {
    return url.trim().replace(/\/$/, '');
  }
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  getOrigin(process.env.FRONTEND_URL)
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Bypass CORS checks in local development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Enforce whitelisting in production
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// --- UNGATED ROUTES (Do not block on database connectivity checks) ---

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "StockFlow API is running"
  });
});

// Production Grade Health Endpoint
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return res.status(200).json({
      success: true,
      api: "StockFlow API",
      database: "connected"
    });
  }

  // Attempt to reconnect if disconnected
  try {
    await connectDB();
    return res.status(200).json({
      success: true,
      api: "StockFlow API",
      database: "connected"
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      api: "StockFlow API",
      database: "disconnected"
    });
  }
});

// --- GATED ROUTES (Guarantees active database connection before executing any queries) ---
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection gating error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection unavailable.'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);

// Error handling for 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId CastError
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `A record with this ${field} already exists.` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ message });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

// Only spin up listener in local development to avoid blocking Vercel Serverless deployments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
