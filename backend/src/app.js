// Express.js - Main application setup
// File: backend/src/app.js

const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth.routes");
const newsRoutes = require("./routes/news.routes");
const summaryRoutes = require("./routes/summary.routes");
const articleRoutes = require("./routes/article.routes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

// Create Express app
const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS (allow frontend at http://localhost:3000)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ============================================================
// ROUTES
// ============================================================

// Health check endpoint (for testing)
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running!" });
});

// Mount route groups
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/articles", articleRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
