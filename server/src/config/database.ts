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
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create Sequelize instance using the same connection config
export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: "postgres",
  logging: config.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 20,
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

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const isDev = config.NODE_ENV === "development";

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Initialize all models using the centralized initialization function
    const models = initializeModels(sequelize);

    // In development, we'll use the init-database.sql script instead of sync
    if (isDev) {
      try {
        // Read and execute the init-database.sql script
        const initScript = fs.readFileSync(
          path.join(__dirname, "../../scripts/init-database.sql"),
          "utf8"
        );
        await sequelize.query(initScript);
        console.log("Database initialized using init-database.sql");
      } catch (error) {
        console.error("Error executing init-database.sql:", error);
        throw error;
      }
    }

    return sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
