import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const apiBaseUrl =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

// Create Axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Automatically attach JWT token to every request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");

    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handle errors globally
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // If 401, token expired or invalid
    if (error.response?.status === 401) {
      // Clear stored token
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
