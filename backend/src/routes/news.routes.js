// News Routes
// File: backend/src/routes/news.routes.js

const express = require("express");
const newsController = require("../controllers/newsController");

const router = express.Router();

/**
 * GET /api/news
 * Get headlines by category
 * Query params: ?category=technology&limit=20&page=1
 */
router.get("/", newsController.getHeadlines);

/**
 * POST /api/news/search
 * Search articles by keyword
 * Body: { query: "string", limit?: number, page?: number }
 */
router.post("/search", newsController.searchArticles);

/**
 * GET /api/news/categories
 * Get available news categories
 */
router.get("/categories", newsController.getCategories);

module.exports = router;
