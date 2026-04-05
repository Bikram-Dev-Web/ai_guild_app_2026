// Authentication Service - Core business logic
// File: backend/src/services/AuthService.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class AuthService {
  /**
   * Register new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password (will be hashed)
   * @param {string} username - Display name
   * @returns {Promise<Object>} Created user object
   */
  static async registerUser(email, password, username) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Hash password using bcryptjs
    // Cost factor = 10 (higher = more secure but slower)
    // bcrypt.hash() returns hashed string like: $2b$10$abcdefghij...
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split("@")[0], // Use email prefix if no username
      },
    });

    // Return user WITHOUT password
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  /**
   * Login user and return JWT token
   * @param {string} email - User email
   * @param {string} password - User password (plain)
   * @returns {Promise<Object>} { token, user }
   */
  static async loginUser(email, password) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare plaintext password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload (what's encoded in token)
      process.env.JWT_SECRET, // Secret key (must match when verifying)
      { expiresIn: process.env.JWT_EXPIRE || "7d" }, // Token expiration
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID from JWT
   * @returns {Promise<Object>} User object
   */
  static async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Return user WITHOUT password
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }
}

module.exports = AuthService;
