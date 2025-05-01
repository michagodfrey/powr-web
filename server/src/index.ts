// Main server entry point that initializes the application
import { createApp } from "./app";
import { initDatabase } from "./config/database";
import { config } from "./config/validateEnv";

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();

    // Create the Express app
    const app = createApp();

    // Start server
    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer();
