// Environment variable validation and configuration
// Ensures all required environment variables are present and properly typed
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  CLIENT_URL: string;
  SERVER_URL: string;
  SESSION_SECRET: string;
  CORS_ORIGIN: string;
  COOKIE_DOMAIN?: string; // Optional, only needed in production
}

export const validateEnv = (): EnvConfig => {
  const requiredVars = [
    "DATABASE_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "CLIENT_URL",
    "SERVER_URL",
    "SESSION_SECRET",
    "CORS_ORIGIN",
  ];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Required environment variable ${varName} is missing`);
    }
  }

  // Validate NODE_ENV
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
  }

  if (!["development", "production", "test"].includes(process.env.NODE_ENV)) {
    throw new Error(
      `Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be development, production, or test`
    );
  }

  // Validate PORT
  const port = parseInt(process.env.PORT || "4000", 10);
  if (isNaN(port)) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  // In production, COOKIE_DOMAIN requirement removed
  if (process.env.NODE_ENV === "production") {

    // Validate CORS_ORIGIN is a valid URL in production
    try {
      new URL(process.env.CORS_ORIGIN!);
    } catch (error) {
      throw new Error("CORS_ORIGIN must be a valid URL in production");
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV as EnvConfig["NODE_ENV"],
    PORT: port,
    DATABASE_URL: process.env.DATABASE_URL!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    CLIENT_URL: process.env.CLIENT_URL!,
    SERVER_URL: process.env.SERVER_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  };
};

export const config = validateEnv();
