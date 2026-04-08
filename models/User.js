// ============================================================
// USER MODEL - MongoDB Schema for Users Collection
// ============================================================
// This file defines the structure of the "users" collection
// in MongoDB Atlas. Think of it like defining columns in SQL.
// ============================================================

const mongoose = require('mongoose');

// Define the schema (structure) for a User document
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,              // Remove extra spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    // User's email address (must be unique)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,            // No two users can have same email
      lowercase: true,         // Store email in lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    // User's password (will be stored as bcrypt hash)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    // Role of the user (student or admin)
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Export the model (so other files can use it)
// Collection name in MongoDB will be "users" (mongoose auto-pluralizes)
module.exports = mongoose.model('User', userSchema);
