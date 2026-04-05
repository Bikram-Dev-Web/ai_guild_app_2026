// Summary Service - Generate AI summaries via Gemini API
// File: backend/src/services/SummaryService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class SummaryService {
  /**
   * Get or generate summary for an article
   * Checks cache first to avoid duplicate API calls
   */
  static async getSummary(articleUrl, articleContent) {
    if (!articleUrl || !articleContent) {
      throw new Error("Article URL and content are required");
    }

    // Check if summary already exists in cache
    const existingSummary = await prisma.summary.findUnique({
      where: { articleUrl },
    });

    if (existingSummary) {
      console.log(`✅ Summary cache HIT for: ${articleUrl}`);
      return {
        summary: existingSummary.summary,
        source: "cached",
        model: existingSummary.summaryModel,
        tokenUsage: existingSummary.tokenUsage,
      };
    }

    // Cache miss: Call Gemini API
    console.log(`🤖 Generating summary via Gemini API...`);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(
        `Summarize the following article in exactly 2 sentences:\n\n${articleContent}`
      );

      const response = await result.response;
      const summary = response.text();

      if (!summary) {
        throw new Error("No summary received from Gemini");
      }

      // Calculate token usage (estimate)
      const tokenUsage = Math.ceil(articleContent.length / 4) + 100; // Rough estimation

      // Cache the summary
      await prisma.summary.create({
        data: {
          articleUrl,
          summary,
          summaryModel: "gemini-2.5-flash",
          tokenUsage,
        },
      });

      console.log(`💾 Summary cached for: ${articleUrl}`);

      return {
        summary,
        source: "generated",
        model: "gemini-2.5-flash",
        tokenUsage,
      };
    } catch (error) {
      console.error("❌ Gemini API Error:", error.message);

      // Provide user-friendly error
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        throw new Error("API rate limited. Please try again in a few moments.");
      }

      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Get cached summary for an article (if exists)
   */
  static async getCachedSummary(articleUrl) {
    const summary = await prisma.summary.findUnique({
      where: { articleUrl },
    });

    return summary || null;
  }

  /**
   * Estimate cost of LLM API usage (for analytics)
   */
  static async getTotalTokenUsage() {
    const result = await prisma.summary.aggregate({
      _sum: {
        tokenUsage: true,
      },
    });

    return result._sum.tokenUsage || 0;
  }
}

module.exports = SummaryService;