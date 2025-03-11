import app from "./app";
import { initDatabase } from "./config/database";

const PORT = process.env.PORT || 4000;

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();

    // Start server after database is ready
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
