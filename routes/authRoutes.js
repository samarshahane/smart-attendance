const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User     = require('../models/User');
const upload   = require('../middleware/s3Upload');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// ──────────────────────────────────────────────
// PASSPORT GOOGLE STRATEGY CONFIG
// ──────────────────────────────────────────────
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.CALLBACK_URL || "/api/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user in our database
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Check if user exists with same email but no Google ID
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google ID to existing email account
          user.googleId = profile.id;
          await user.save();
        } else {
          // Create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePictureUrl: profile.photos[0].value // Use Google profile pic as default
          });
          await user.save();
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ──────────────────────────────────────────────
// POST /api/register
// Purpose: Register a new user
// Access: Public (no token needed)
// ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    // Step 1: Get data from request body
    const { name, email, password } = req.body;

    // Step 2: Basic validation - check if fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Step 3: Check if user already exists in database
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email. Please login.'
      });
    }

    // Step 4: Hash the password using bcrypt
    // Salt rounds = 10 means the password is hashed 2^10 = 1024 times
    // This makes it extremely hard to crack even if database is stolen
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 5: Create new user document in MongoDB
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword  // Store hashed password, never plain text!
    });

    // Step 6: Save to database
    await newUser.save();

    // Step 7: Send success response (don't send password back)
    res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now login.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
});

// ──────────────────────────────────────────────
// POST /api/login
// Purpose: Login user and return JWT token
// Access: Public (no token needed)
// ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    // Step 1: Get credentials from request body
    const { email, password } = req.body;

    // Step 2: Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Step 3: Find user in database by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Step 4: Compare entered password with hashed password in DB
    // bcrypt.compare() automatically handles the hashing comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Step 5: Generate JWT Token
    // This token contains user info and expires in 24 hours
    const token = jwt.sign(
      {
        userId: user._id,    // Payload: user data embedded in token
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,  // Secret key for signing
      { expiresIn: '24h' }     // Token expires in 24 hours
    );

    // Step 6: Send token and user info to client
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

// ──────────────────────────────────────────────
// GOOGLE AUTH ROUTES
// ──────────────────────────────────────────────

// Trigger Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback: After Google authenticates, it sends user here
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/?error=google_failed' }),
  (req, res) => {
    // Generate JWT for the frontend to use
    const token = generateToken(req.user);
    const userData = JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePictureUrl: req.user.profilePictureUrl
    });

    // Redirect back to frontend with token and user in URL (temporary for login)
    // The frontend JS will catch this and save to localStorage
    res.redirect(`/?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

// ──────────────────────────────────────────────
// S3 PROFILE UPLOAD
// ──────────────────────────────────────────────
router.post('/upload-profile', verifyToken, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // multer-s3 attaches the location (URL) to req.file
    const imageUrl = req.file.location;

    // Update user in DB
    await User.findByIdAndUpdate(req.user.userId, { profilePictureUrl: imageUrl });

    res.json({
      success: true,
      message: 'Profile picture updated successfully!',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Error uploading to cloud storage.' });
  }
});

module.exports = router;
