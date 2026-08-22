// Database configuration and connection management
// Connects to Supabase Postgres via its pooled ("Transaction" mode / pgbouncer)
// connection string, sized for a serverless (Vercel) deployment.
import { Sequelize } from "sequelize";
import { config } from "./validateEnv";
import { initializeModels } from "../models";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

// Create a single pool instance to be shared
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: config.NODE_ENV === "production" ? 2 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Create Sequelize instance using the same connection config
export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: "postgres",
  logging: config.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: config.NODE_ENV === "production" ? 2 : 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions:
    config.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

// A serverless function shouldn't kill its own process on a pool error —
// just log it and let the next request retry.
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export const isDev = config.NODE_ENV === "development";

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Initialize all models using the centralized initialization function
    initializeModels(sequelize);

    // In development, we'll use the init-database.sql script instead of sync
    if (isDev) {
      const initScript = fs.readFileSync(
        path.join(__dirname, "../../scripts/init-database.sql"),
        "utf8"
      );
      await sequelize.query(initScript);
      console.log("Database initialized using init-database.sql");
    }

    return sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
