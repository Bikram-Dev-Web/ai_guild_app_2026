// Article Controller - Handle bookmarking requests
// File: backend/src/controllers/articleController.js

const ArticleService = require("../services/ArticleService");

class ArticleController {
  /**
   * POST /api/articles
   * Bookmark an article (Protected route)
   */
  static async bookmarkArticle(req, res, next) {
    try {
      const { articleId, notes = "" } = req.body;
      const userId = req.userId; // From authMiddleware

      if (!articleId) {
        return res.status(400).json({
          success: false,
          error: "Article ID is required",
        });
      }

      // Bookmark the article
      const bookmark = await ArticleService.bookmarkArticle(
        userId,
        articleId,
        notes,
      );

      res.status(201).json({
        success: true,
        message: "Article bookmarked successfully",
        data: bookmark,
      });
    } catch (error) {
      if (error.message === "Article not found") {
        return res.status(404).json({
          success: false,
          error: "Article not found",
        });
      }

      if (error.message === "Article already bookmarked") {
        return res.status(409).json({
          success: false,
          error: "Article already bookmarked",
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/articles
   * Get user's bookmarked articles (Protected route)
   */
  static async getUserBookmarks(req, res, next) {
    try {
      const userId = req.userId; // From authMiddleware
      const { limit = "20", page = "1", sortBy = "newest" } = req.query;

      const limitNum = Math.min(parseInt(limit) || 20, 50);
      const pageNum = Math.max(parseInt(page) || 1, 1);

      // Get bookmarks
      const result = await ArticleService.getUserBookmarks(
        userId,
        limitNum,
        pageNum,
        sortBy,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/articles/:bookmarkId
   * Remove bookmark (Protected route)
   */
  static async removeBookmark(req, res, next) {
    try {
      const { bookmarkId } = req.params;
      const userId = req.userId; // From authMiddleware

      if (!bookmarkId) {
        return res.status(400).json({
          success: false,
          error: "Bookmark ID is required",
        });
      }

      // Remove bookmark (with ownership check)
      await ArticleService.removeBookmark(userId, parseInt(bookmarkId));

      res.status(200).json({
        success: true,
        message: "Article removed from library",
      });
    } catch (error) {
      if (error.message.includes("Not authorized")) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this bookmark",
        });
      }

      if (error.message === "Bookmark not found") {
        return res.status(404).json({
          success: false,
          error: "Bookmark not found",
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/articles/:articleId/check
   * Check if article is bookmarked (Protected route)
   */
  static async checkBookmarked(req, res, next) {
    try {
      const { articleId } = req.params;
      const userId = req.userId; // From authMiddleware

      if (!articleId) {
        return res.status(400).json({
          success: false,
          error: "Article ID is required",
        });
      }

      const isBookmarked = await ArticleService.isArticleBookmarked(
        userId,
        parseInt(articleId),
      );

      res.status(200).json({
        success: true,
        data: { isBookmarked },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ArticleController;
