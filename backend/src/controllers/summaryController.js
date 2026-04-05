// Summary Controller - Handle AI summary requests
// File: backend/src/controllers/summaryController.js

const SummaryService = require("../services/SummaryService");

class SummaryController {
  /**
   * POST /api/summary
   * Generate summary for article (Protected route)
   */
  static async generateSummary(req, res, next) {
    try {
      const { articleUrl, articleContent } = req.body;

      if (!articleUrl || !articleContent) {
        return res.status(400).json({
          success: false,
          error: "Article URL and content are required",
        });
      }

      // Limit content length to save API costs
      const maxLength = 3000; // Characters
      const truncatedContent =
        articleContent.length > maxLength
          ? articleContent.substring(0, maxLength) + "..."
          : articleContent;

      // Get or generate summary
      const result = await SummaryService.getSummary(
        articleUrl,
        truncatedContent,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error.message.includes("API rate limited")) {
        return res.status(429).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/summary/:articleUrl
   * Get cached summary (Protected route)
   */
  static async getCachedSummary(req, res, next) {
    try {
      const { articleUrl } = req.params;

      const summary = await SummaryService.getCachedSummary(
        decodeURIComponent(articleUrl),
      );

      if (!summary) {
        return res.status(404).json({
          success: false,
          error: "Summary not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          summary: summary.summary,
          model: summary.summaryModel,
          createdAt: summary.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SummaryController;
