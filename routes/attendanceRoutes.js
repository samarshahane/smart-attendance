// ============================================================
// ATTENDANCE ROUTES - Mark and View Attendance
// ============================================================
// This file handles:
//   POST /api/mark    → Mark attendance for today (Protected)
//   GET  /api/records → Get user's attendance records (Protected)
// ============================================================

const express      = require('express');
const Attendance   = require('../models/Attendance');
const verifyToken  = require('../middleware/authMiddleware');

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/mark
// Purpose: Mark attendance for the logged-in user
// Access: Protected (requires valid JWT token)
// ──────────────────────────────────────────────
router.post('/mark', verifyToken, async (req, res) => {
  try {
    // Step 1: Get user info from the decoded JWT token
    // (verifyToken middleware added this to req.user)
    const { userId, name, email } = req.user;

    // Step 2: Get today's date and current time
    const now = new Date();

    // Format date as YYYY-MM-DD (e.g., "2024-01-15")
    const date = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format

    // Format time as HH:MM:SS AM/PM (e.g., "10:30:00 AM")
    const time = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'  // IST timezone
    });

    // Get day of week (e.g., "Monday")
    const dayOfWeek = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      timeZone: 'Asia/Kolkata'
    });

    // Step 3: Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({ userId, date });
    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: `Attendance already marked for today (${date}) at ${existingAttendance.time}`
      });
    }

    // Step 4: Determine if student is late (after 9 AM = late)
    const hour = now.getHours();
    const status = hour >= 9 ? 'late' : 'present';

    // Step 5: Create attendance record in database
    const attendance = new Attendance({
      userId,
      userName: name,
      userEmail: email,
      date,
      time,
      dayOfWeek,
      status
    });

    // Step 6: Save to MongoDB
    await attendance.save();

    // Step 7: Send success response
    res.status(201).json({
      success: true,
      message: `✅ Attendance marked successfully for ${date}!`,
      data: {
        date,
        time,
        dayOfWeek,
        status,
        userName: name
      }
    });

  } catch (error) {
    // Handle duplicate key error (user marked attendance twice same day)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for today!'
      });
    }

    console.error('Mark Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking attendance.'
    });
  }
});

// ──────────────────────────────────────────────
// GET /api/records
// Purpose: Fetch all attendance records for logged-in user
// Access: Protected (requires valid JWT token)
// ──────────────────────────────────────────────
router.get('/records', verifyToken, async (req, res) => {
  try {
    // Step 1: Get user ID from token
    const { userId } = req.user;

    // Step 2: Fetch all attendance records for this user
    // Sort by date in descending order (newest first)
    const records = await Attendance
      .find({ userId })
      .sort({ date: -1, createdAt: -1 })  // Newest first
      .select('-__v');                      // Exclude internal __v field

    // Step 3: Calculate statistics
    const totalDays   = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays    = records.filter(r => r.status === 'late').length;
    const percentage  = totalDays > 0
      ? Math.round(((presentDays + lateDays) / totalDays) * 100)
      : 0;

    // Step 4: Send records and stats
    res.status(200).json({
      success: true,
      message: `Found ${totalDays} attendance records`,
      stats: {
        totalDays,
        presentDays,
        lateDays,
        attendancePercentage: percentage
      },
      records
    });

  } catch (error) {
    console.error('Fetch Records Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records.'
    });
  }
});

// ──────────────────────────────────────────────
// GET /api/profile
// Purpose: Get logged-in user's profile info
// Access: Protected
// ──────────────────────────────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Find user but exclude password from response
    const user = await require('../models/User')
      .findById(userId)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
