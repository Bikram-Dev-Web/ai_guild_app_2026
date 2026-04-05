// Auth Routes
// File: backend/src/routes/auth.routes.js

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Login and get JWT token
 */
router.post("/login", authController.login);

/**
 * GET /api/auth/me
 * Get current user (Protected route)
 */
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
