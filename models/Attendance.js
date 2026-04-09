// ============================================================
// ATTENDANCE MODEL - MongoDB Schema for Attendance Collection
// ============================================================
// This file defines the structure of the "attendances" collection
// in MongoDB Atlas. Each document = one attendance record.
// ============================================================

const mongoose = require('mongoose');

// Define the schema (structure) for an Attendance document
const attendanceSchema = new mongoose.Schema(
  {
    // Reference to which user marked this attendance
    // ObjectId links to the User collection (like a Foreign Key in SQL)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',             // Reference to the 'User' model
      required: [true, 'User ID is required']
    },

    // Store user's name for easy display (denormalization for performance)
    userName: {
      type: String,
      required: true
    },

    // Store user's email for easy display
    userEmail: {
      type: String,
      required: true
    },

    // Date of attendance (e.g., "2024-01-15")
    date: {
      type: String,
      required: [true, 'Date is required']
    },

    // Time of attendance (e.g., "10:30:00 AM")
    time: {
      type: String,
      required: [true, 'Time is required']
    },

    // Status of attendance
    status: {
      type: String,
      enum: ['present', 'late', 'absent'],
      default: 'present'
    },

    // Day of the week (Monday, Tuesday, etc.)
    dayOfWeek: {
      type: String
    },

    // Subject name (e.g., "Cloud Computing")
    subject: {
      type: String,
      required: true
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Create a compound index to prevent duplicate attendance for same user, date AND subject
// This ensures a user cannot mark attendance for the SAME lecture twice, 
// but CAN mark for different subjects on the same day.
attendanceSchema.index({ userId: 1, date: 1, subject: 1 }, { unique: true });

// Export the model
// Collection name in MongoDB will be "attendances"
module.exports = mongoose.model('Attendance', attendanceSchema);
