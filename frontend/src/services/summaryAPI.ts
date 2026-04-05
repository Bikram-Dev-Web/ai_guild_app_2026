import api from "./apiClient";

export const summaryAPI = {
  /**
   * Generate summary for article
   */
  generateSummary: async (articleUrl: string, articleContent: string) => {
    try {
      const response = await api.post("/summary", {
        articleUrl,
        articleContent,
      });
      return response.data;
    } catch (error: any) {
      console.error("Summary API Error:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get cached summary
   */
  getCachedSummary: async (articleUrl: string) => {
    try {
      const response = await api.get(
        `/summary/${encodeURIComponent(articleUrl)}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Get Summary Error:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default summaryAPI;
