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

const { WEEKLY_TIMETABLE, getCurrentSubject } = require('../utils/timetable');

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/mark
// Purpose: Mark attendance for the LOGGED-IN lecture
// Access: Protected (requires valid JWT token)
// ──────────────────────────────────────────────
router.post('/mark', verifyToken, async (req, res) => {
  try {
    const { userId, name, email } = req.user;
    const now = new Date();

    // Step 1: Check TIMETABLE - Is there a class right now?
    const currentClass = getCurrentSubject(now);
    
    if (!currentClass) {
      return res.status(400).json({
        success: false,
        message: 'No active lecture found at this time. You can only mark attendance during class hours.'
      });
    }

    const subjectName = currentClass.name;

    // Step 2: Get today's date and current time (IST)
    const date = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const time = now.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', 
      hour12: true, timeZone: 'Asia/Kolkata'
    });
    const dayOfWeek = now.toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' });

    // Step 3: Check if attendance already marked for THIS SUBJECT today
    const existing = await Attendance.findOne({ userId, date, subject: subjectName });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Attendance already marked for ${subjectName} today at ${existing.time}`
      });
    }

    // Step 4: Determine status (Late if 10 mins after start)
    const [startHour, startMin] = currentClass.start.split(':').map(Number);
    const markHour = now.getHours();
    const markMin = now.getMinutes();
    
    let status = 'present';
    if (markHour > startHour || (markHour === startHour && markMin > startMin + 10)) {
      status = 'late';
    }

    // Step 5: Save Record
    const attendance = new Attendance({
      userId, userName: name, userEmail: email,
      date, time, dayOfWeek, status, subject: subjectName
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: `✅ Attendance for ${subjectName} marked successfully!`,
      data: { subject: subjectName, date, time, status }
    });

  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ success: false, message: 'Server error while marking attendance.' });
  }
});

// ──────────────────────────────────────────────
// GET /api/records
// Purpose: Fetch all attendance records with Subject Breakdown
// Access: Protected
// ──────────────────────────────────────────────
router.get('/records', verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // 1. Fetch all records
    const records = await Attendance.find({ userId }).sort({ createdAt: -1 });

    // 2. Identify all unique subjects from the Timetable
    const allSubjects = [];
    Object.values(WEEKLY_TIMETABLE).forEach(dayClasses => {
      dayClasses.forEach(cls => {
        if (!allSubjects.includes(cls.name)) allSubjects.push(cls.name);
      });
    });

    // 3. Calculate breakdown per subject
    const subjectStats = allSubjects.map(subName => {
      const subRecords = records.filter(r => r.subject === subName);
      const presentCount = subRecords.filter(r => r.status !== 'absent').length;
      
      return {
        name: subName,
        attended: presentCount,
        percentage: subRecords.length > 0 ? Math.round((presentCount / subRecords.length) * 100) : 0
      };
    });

    // 4. Overall stats
    const totalAttended = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const lateCount = records.filter(r => r.status === 'late').length;

    res.status(200).json({
      success: true,
      stats: {
        totalDays: totalAttended,
        presentDays: presentCount,
        lateDays: lateCount,
        subjectBreakdown: subjectStats
      },
      records,
      timetable: WEEKLY_TIMETABLE // Send TT to frontend for display
    });

  } catch (error) {
    console.error('Fetch Records Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching records.' });
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
