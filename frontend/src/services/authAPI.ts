import api from "./apiClient";

// interface RegisterData {
//   email: string;
//   password: string;
//   username: string;
// }
//
// interface LoginData {
//   email: string;
//   password: string;
// }

export const authAPI = {
  /**
   * Register new user
   */
  register: async (email: string, password: string, username: string) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        username,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Save token and user to localStorage
      if (response.data.data.token) {
        localStorage.setItem("authToken", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

export default authAPI;
