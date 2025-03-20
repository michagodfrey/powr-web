// Main server entry point that initializes the application
// Handles database setup, passport configuration, and error handling
import { createApp } from "./app";
import { initDatabase } from "./config/database";
import { configurePassport } from "./config/passport";

const PORT = process.env.PORT || 4000;

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();

    // Configure passport after database is initialized
    const configuredPassport = configurePassport();

    // Create the Express app with the configured passport
    const app = createApp(configuredPassport);

    // Start server after all initialization is complete
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
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
