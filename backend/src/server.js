// Server startup file
// File: backend/src/server.js

// LOAD environment variables FIRST - before importing anything else
require("dotenv").config();

const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// ============================================================
// START SERVER
// ============================================================

let server;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🚀 NovaNews Backend Running           ║
║  Port: ${PORT}                             ║
║  Environment: ${process.env.NODE_ENV || "development"}         ║
║  API Docs: http://localhost:${PORT}/api ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

// Handle unexpected errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle shutdown signals (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("\n🛑 Server shutting down...");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log("✅ Server stopped");
      process.exit(0);
    });
  }
});

// Start the server
startServer();

module.exports = { app, prisma };
