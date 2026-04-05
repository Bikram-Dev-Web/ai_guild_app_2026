// Summary Routes
// File: backend/src/routes/summary.routes.js

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const summaryController = require("../controllers/summaryController");

const router = express.Router();

/**
 * POST /api/summary
 * Generate summary for an article (Protected route)
 * Body: { articleUrl: string, articleContent: string }
 */
router.post("/", authMiddleware, summaryController.generateSummary);

/**
 * GET /api/summary/:articleUrl
 * Get cached summary (Protected route)
 */
router.get("/:articleUrl", authMiddleware, summaryController.getCachedSummary);

module.exports = router;
