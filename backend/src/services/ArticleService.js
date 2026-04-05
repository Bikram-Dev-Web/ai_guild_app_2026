// Article Service - Manage user bookmarks
// File: backend/src/services/ArticleService.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ArticleService {
  /**
   * Bookmark an article for a user
   */
  static async bookmarkArticle(userId, articleId, notes = "") {
    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error("Article not found");
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });

    if (existing) {
      throw new Error("Article already bookmarked");
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        articleId,
        notes,
      },
    });

    return bookmark;
  }

  /**
   * Remove bookmark
   */
  static async removeBookmark(userId, bookmarkId) {
    // Verify ownership (user can only delete their own bookmarks)
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) {
      throw new Error("Bookmark not found");
    }

    if (bookmark.userId !== userId) {
      throw new Error("Not authorized to delete this bookmark");
    }

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    return { success: true };
  }

  /**
   * Get all bookmarks for a user
   */
  static async getUserBookmarks(
    userId,
    limit = 20,
    page = 1,
    sortBy = "newest",
  ) {
    const offset = (page - 1) * limit;

    // Determine sort order
    let orderBy = { createdAt: "desc" }; // newest first
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    // Get bookmarks with related article data
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: true,
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.bookmark.count({
      where: { userId },
    });

    return {
      bookmarks,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if user has bookmarked an article
   */
  static async isArticleBookmarked(userId, articleId) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });

    return !!bookmark;
  }

  /**
   * Get bookmark count for user
   */
  static async getUserBookmarkCount(userId) {
    return prisma.bookmark.count({
      where: { userId },
    });
  }
}

module.exports = ArticleService;
