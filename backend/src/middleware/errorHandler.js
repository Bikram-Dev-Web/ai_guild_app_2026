// Global Error Handler Middleware
// File: backend/src/middleware/errorHandler.js

/**
 * Centralized error handling middleware
 * Catches all errors and returns consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Default to 500 if no status code
  const statusCode = err.statusCode || 500;

  // Prisma unique constraint error
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // Prisma not found error
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: "Resource not found",
    });
  }

  // Generic error response
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
