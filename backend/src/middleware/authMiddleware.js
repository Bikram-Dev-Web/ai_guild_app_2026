// JWT Authentication Middleware
// File: backend/src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token
 * Extracts token from "Authorization: Bearer <token>" header
 * Attaches userId to req.userId if valid
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header",
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to request object (for use in controllers)
    req.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
