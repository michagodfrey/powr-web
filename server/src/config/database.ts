// Database configuration and connection management
// In production, DATABASE_URL is Supabase's pooled ("Transaction" mode /
// pgbouncer) connection string, sized for a serverless (Vercel) deployment.
// In local dev, DATABASE_URL should point at a local Postgres database
// instead (see server/.env.example) — never at the same database as
// production, since `npm run setup:db` drops and recreates every table.
import { Sequelize } from "sequelize";
import { config } from "./validateEnv";
import { initializeModels } from "../models";
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

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Initialize all models using the centralized initialization function
    initializeModels(sequelize);

    // Schema setup (scripts/init-database.sql, which DROPs and recreates
    // every table) is a deliberate, manual step — `npm run setup:db` — not
    // something that runs implicitly on every server start. Running it
    // automatically here previously wiped whatever DATABASE_URL pointed at
    // on every dev server boot.

    return sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
