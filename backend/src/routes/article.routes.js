// Article Routes
// File: backend/src/routes/article.routes.js

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const articleController = require("../controllers/articleController");

const router = express.Router();

/**
 * POST /api/articles
 * Bookmark an article (Protected route)
 * Body: { articleId: number, notes?: string }
 */
router.post("/", authMiddleware, articleController.bookmarkArticle);

/**
 * GET /api/articles
 * Get user's bookmarked articles (Protected route)
 * Query params: ?limit=20&page=1&sortBy=newest
 */
router.get("/", authMiddleware, articleController.getUserBookmarks);

/**
 * DELETE /api/articles/:bookmarkId
 * Remove bookmark (Protected route)
 */
router.delete("/:bookmarkId", authMiddleware, articleController.removeBookmark);

/**
 * GET /api/articles/:articleId/check
 * Check if article is bookmarked (Protected route)
 */
router.get(
  "/:articleId/check",
  authMiddleware,
  articleController.checkBookmarked,
);

module.exports = router;
