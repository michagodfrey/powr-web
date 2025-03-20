// Database initialization script that runs initial schema migrations
// Sets up required tables and indexes for the application
import { pool } from "../config/database";
import fs from "fs";
import path from "path";

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // Read and execute the initialization SQL
    const sqlPath = path.join(__dirname, "../db/migrations/init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    await pool.query(sql);
    console.log("Database setup complete");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("Database setup complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database setup failed:", error);
      process.exit(1);
    });
}

export { setupDatabase };
