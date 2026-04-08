// ============================================================
// JWT MIDDLEWARE - Token Verification
// ============================================================
// This middleware protects routes that require login.
// It checks if the user sent a valid JWT token in their request.
//
// HOW JWT WORKS:
// 1. User logs in → server creates a token → sends it to client
// 2. Client stores token in browser (localStorage)
// 3. Every protected request → client sends token in headers
// 4. This middleware checks if token is valid
// ============================================================

const jwt = require('jsonwebtoken');

// Middleware function (runs before the actual route handler)
const verifyToken = (req, res, next) => {
  // Get the token from the request headers
  // Expected format: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  // Check if token was provided
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please login first.'
    });
  }

  // Extract token (remove "Bearer " prefix)
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  // Verify the token using our secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object (so route handlers can use it)
    req.user = decoded;

    // Call next() to pass control to the actual route handler
    next();

  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

module.exports = verifyToken;
