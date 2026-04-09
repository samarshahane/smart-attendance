// ============================================================
// SMART ATTENDANCE SYSTEM - Main Server File
// ============================================================
// This is the entry point of our backend application.
// It sets up Express, connects to MongoDB, and mounts routes.
// ============================================================

// Load environment variables from .env file
require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const passport   = require('passport');
const session    = require('express-session'); // Required for passport sessions

// Import route files
const authRoutes       = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// ──────────────────────────────────────────────
// Initialize Express App
// ──────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Middleware Configuration
// ──────────────────────────────────────────────

// Parse incoming JSON requests (like a translator for JSON data)
app.use(express.json());

// Enable Cross-Origin Resource Sharing
// This allows the frontend (different port/IP) to talk to our backend
app.use(cors({
  origin: '*',           // In production, restrict to your domain/IP
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'attendance-secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static frontend files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────
// Connect to MongoDB Atlas
// ──────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB Atlas connected successfully!');
  })
  .catch((error) => {
    console.error('❌  MongoDB connection failed:', error.message);
    process.exit(1); // Exit if DB connection fails
  });

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────

// Authentication routes: /api/register and /api/login
app.use('/api', authRoutes);

// Attendance routes: /api/mark and /api/records
app.use('/api', attendanceRoutes);

// ──────────────────────────────────────────────
// Health Check Route
// ──────────────────────────────────────────────
// Visit http://your-ip:5000/api/health to check if server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Attendance System API is running!',
    timestamp: new Date().toISOString()
  });
});

// ──────────────────────────────────────────────
// Fallback: Serve Frontend for All Other Routes
// ──────────────────────────────────────────────
// When user visits any non-API route, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend:    http://localhost:${PORT}`);
});
