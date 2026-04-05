// News Service - Handle article fetching and caching
// File: backend/src/services/NewsService.js

const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Cache duration in minutes
const CACHE_DURATION = 30;

class NewsService {
  /**
   * Get headlines with caching
   * Check cache first; if expired or missing, fetch from NewsAPI
   */
  static async getHeadlines(category = "general", limit = 20, page = 1) {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // DEBUG: Check if API key is loaded
    if (!process.env.NEWS_API_KEY) {
      console.error("❌ NEWS_API_KEY is not set in .env file!");
      throw new Error("NEWS_API_KEY environment variable is missing");
    }
    console.log(
      `🔑 Using NEWS_API_KEY: ${process.env.NEWS_API_KEY.slice(0, 10)}...`,
    );

    // Check cache: get articles from this category cached within last 30 minutes
    const cachedArticles = await prisma.article.findMany({
      where: {
        category,
        createdAt: {
          // Only return if created within last 30 minutes
          gte: new Date(Date.now() - CACHE_DURATION * 60 * 1000),
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: offset,
      take: limit,
    });

    // Cache HIT: Return cached results
    if (cachedArticles.length > 0) {
      console.log(`✅ Cache HIT for category: ${category}`);
      return cachedArticles;
    }

    // Cache MISS: Fetch from NewsAPI
    console.log(
      `📡 Cache MISS for category: ${category}. Fetching from API...`,
    );

    try {
      console.log("📡 Making request to NewsAPI with params:", {
        category: category === "general" ? "general" : category,
        pageSize: 100,
        sortBy: "publishedAt",
        country: "us",
      });
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          category: category === "general" ? "general" : category,
          pageSize: 100, // Fetch more to cache
          sortBy: "publishedAt",
          apiKey: process.env.NEWS_API_KEY,
          country: "us", // Optional: US news
        },
      });

      const articles = response.data.articles || [];

      // Store fetched articles in database cache
      // skipDuplicates: true = ignore if article.url already exists
      await prisma.article.createMany({
        data: articles.map((article) => ({
          url: article.url,
          title: article.title,
          description: article.description,
          content: article.content,
          author: article.author,
          imageUrl: article.urlToImage,
          source: article.source.name,
          category: category,
          publishedAt: new Date(article.publishedAt),
        })),
        skipDuplicates: true,
      });

      console.log(
        `💾 Cached ${articles.length} articles for category: ${category}`,
      );

      // Return paginated results
      return articles.slice(offset, offset + limit);
    } catch (error) {
      console.error("❌ NewsAPI Error:", error.message);

      // Log full error response for debugging
      if (error.response) {
        console.error("📋 API Response Status:", error.response.status);
        console.error(
          "📋 API Response Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.error("📋 Error Details:", error);
      }

      // Fallback: Return older cached articles (even if > 30 min old)
      const fallbackArticles = await prisma.article.findMany({
        where: { category },
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit,
      });

      if (fallbackArticles.length > 0) {
        console.log(`⚠️  Using stale cache for ${category}`);
        return fallbackArticles;
      }

      throw new Error(
        `NewsAPI Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Search articles by keyword
   * Checks cache first, then calls NewsAPI
   */
  static async searchArticles(query, limit = 20, page = 1) {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    // DEBUG: Check if API key is loaded
    if (!process.env.NEWS_API_KEY) {
      console.error("❌ NEWS_API_KEY is not set in .env file!");
      throw new Error("NEWS_API_KEY environment variable is missing");
    }

    const offset = (page - 1) * limit;

    // Check cache first
    const cachedResults = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        createdAt: {
          gte: new Date(Date.now() - CACHE_DURATION * 60 * 1000),
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: offset,
      take: limit,
    });

    if (cachedResults.length > 0) {
      console.log(`✅ Cache HIT for search: "${query}"`);
      return cachedResults;
    }

    // Cache miss: Fetch from NewsAPI
    try {
      console.log(`🔍 Searching NewsAPI for: "${query}"`);
      const response = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          q: query,
          pageSize: 100,
          sortBy: "publishedAt",
          apiKey: process.env.NEWS_API_KEY,
          language: "en",
        },
      });

      const articles = response.data.articles || [];

      // Cache the results
      await prisma.article.createMany({
        data: articles.map((article) => ({
          url: article.url,
          title: article.title,
          description: article.description,
          content: article.content,
          author: article.author,
          imageUrl: article.urlToImage,
          source: article.source.name,
          category: "general", // Search results are mixed categories
          publishedAt: new Date(article.publishedAt),
        })),
        skipDuplicates: true,
      });

      console.log(
        `💾 Cached ${articles.length} search results for: "${query}"`,
      );
      return articles.slice(offset, offset + limit);
    } catch (error) {
      console.error("❌ NewsAPI Search Error:", error.message);

      // Log full error response for debugging
      if (error.response) {
        console.error("📋 API Response Status:", error.response.status);
        console.error(
          "📋 API Response Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.error("📋 Error Details:", error);
      }

      // Fallback to stale cache
      const fallback = await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit,
      });

      if (fallback.length > 0) {
        return fallback;
      }

      throw new Error(
        `NewsAPI Search Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Get total count of cached articles
   */
  static async getTotalArticlesCount(category = null) {
    return prisma.article.count({
      where: category ? { category } : {},
    });
  }
}

module.exports = NewsService;
