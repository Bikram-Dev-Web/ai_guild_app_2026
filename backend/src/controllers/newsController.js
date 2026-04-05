// News Controller - Handle news fetching requests
// File: backend/src/controllers/newsController.js

const NewsService = require("../services/NewsService");

class NewsController {
  /**
   * GET /api/news
   * Get headlines by category
   */
  static async getHeadlines(req, res, next) {
    try {
      const { category = "general", limit = "20", page = "1" } = req.query;

      // Parse limits
      const limitNum = Math.min(parseInt(limit) || 20, 50); // Cap at 50
      const pageNum = Math.max(parseInt(page) || 1, 1);

      // Valid categories
      const validCategories = [
        "business",
        "entertainment",
        "general",
        "health",
        "science",
        "sports",
        "technology",
      ];

      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Valid: ${validCategories.join(", ")}`,
        });
      }

      // Fetch headlines
      const articles = await NewsService.getHeadlines(
        category,
        limitNum,
        pageNum,
      );

      // Get total count
      const total = await NewsService.getTotalArticlesCount(category);

      res.status(200).json({
        success: true,
        data: {
          articles,
          pagination: {
            currentPage: pageNum,
            pageSize: limitNum,
            totalItems: total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/news/search
   * Search articles by keyword
   */
  static async searchArticles(req, res, next) {
    try {
      const { query, limit = "20", page = "1" } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Search query cannot be empty",
        });
      }

      const limitNum = Math.min(parseInt(limit) || 20, 50);
      const pageNum = Math.max(parseInt(page) || 1, 1);

      // Search articles
      const articles = await NewsService.searchArticles(
        query,
        limitNum,
        pageNum,
      );

      res.status(200).json({
        success: true,
        data: {
          query,
          articles,
          pagination: {
            currentPage: pageNum,
            pageSize: limitNum,
            totalPages: Math.ceil(articles.length / limitNum),
          },
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/news/categories
   * Get available news categories
   */
  static async getCategories(req, res, next) {
    const categories = [
      { id: "technology", label: "Technology", icon: "💻" },
      { id: "science", label: "Science", icon: "🔬" },
      { id: "health", label: "Health", icon: "🏥" },
      { id: "business", label: "Business", icon: "💼" },
      { id: "entertainment", label: "Entertainment", icon: "🎬" },
      { id: "sports", label: "Sports", icon: "⚽" },
      { id: "general", label: "General", icon: "📰" },
    ];

    res.status(200).json({
      success: true,
      data: categories,
    });
  }
}

module.exports = NewsController;
