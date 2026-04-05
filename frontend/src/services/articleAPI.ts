import api from "./apiClient";

export const articleAPI = {
  /**
   * Bookmark an article
   */
  bookmarkArticle: async (articleId: string, notes = "") => {
    try {
      const response = await api.post("/articles", {
        articleId,
        notes,
      });
      return response.data;
    } catch (error: any) {
      console.error("Bookmark Error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user's bookmarked articles
   */
  getUserBookmarks: async (limit = 20, page = 1, sortBy = "newest") => {
    try {
      const response = await api.get("/articles", {
        params: { limit, page, sortBy },
      });
      return response.data;
    } catch (error: any) {
      console.error("Get Bookmarks Error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Remove bookmark
   */
  removeBookmark: async (bookmarkId: string) => {
    try {
      const response = await api.delete(`/articles/${bookmarkId}`);
      return response.data;
    } catch (error: any) {
      console.error("Remove Bookmark Error:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default articleAPI;
