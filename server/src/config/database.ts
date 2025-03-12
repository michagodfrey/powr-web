import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { initializeModels } from "../models";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isDev = process.env.NODE_ENV === "development";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: isDev ? console.log : false,
  ssl: process.env.NODE_ENV === "production",
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    // Use snake_case for database column names
    underscored: true,
    // Don't pluralize table names
    freezeTableName: true,
    // Add timestamps by default
    timestamps: true,
    // Use snake_case for timestamps
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Initialize all models using the centralized initialization function
    const models = initializeModels(sequelize);

    // Create session table and index in separate queries
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS "IDX_sessions_expire" ON "sessions" ("expire")
    `;

    // Execute queries in sequence
    await sequelize.query(createTableSQL);
    console.log("Session table created");

    await sequelize.query(createIndexSQL);
    console.log("Session index created");

    // Sync database in development
    if (isDev) {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized");
    }

    return sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default sequelize;
