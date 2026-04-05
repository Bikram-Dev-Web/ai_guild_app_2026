// Auth Controller - Handle authentication requests
// File: backend/src/controllers/authController.js

const AuthService = require("../services/AuthService");

class AuthController {
  /**
   * POST /api/auth/register
   * Register new user
   */
  static async register(req, res, next) {
    try {
      const { email, password, username } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Register user
      const user = await AuthService.registerUser(email, password, username);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      // Check for known errors
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          error: "Email already exists",
        });
      }

      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Login user
      const { token, user } = await AuthService.loginUser(email, password);

      res.status(200).json({
        success: true,
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      if (error.message === "Invalid email or password") {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current logged-in user (Protected route)
   */
  static async getMe(req, res, next) {
    try {
      // req.userId is set by authMiddleware
      const user = await AuthService.getUserById(req.userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
  }
}

module.exports = AuthController;
