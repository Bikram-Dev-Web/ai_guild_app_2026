import api from "./apiClient";

// interface HeadlinesParams {
//   category?: string;
//   limit?: number;
//   page?: number;
// }
//
// interface SearchParams {
//   query: string;
//   limit?: number;
//   page?: number;
// }

export const newsAPI = {
  /**
   * Get headlines by category
   */
  getHeadlines: async (category = "general", limit = 20, page = 1) => {
    try {
      const response = await api.get("/news", {
        params: { category, limit, page },
      });
      return response.data;
    } catch (error: any) {
      console.error("News API Error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Search articles by keyword
   */
  searchArticles: async (query: string, limit = 20, page = 1) => {
    try {
      const response = await api.post("/news/search", {
        query,
        limit,
        page,
      });
      return response.data;
    } catch (error: any) {
      console.error("Search API Error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get available categories
   */
  getCategories: async () => {
    try {
      const response = await api.get("/news/categories");
      return response.data;
    } catch (error: any) {
      console.error("Categories API Error:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default newsAPI;
