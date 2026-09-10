// Environment variable validation and configuration
// Ensures all required environment variables are present and properly typed
import dotenv from "dotenv";
import { cleanEnv, str, port, url } from "envalid";

// Load environment variables
dotenv.config();

export const config = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "test", "production"] }),
  PORT: port({ default: 4000 }),
  DATABASE_URL: str(),
  TEST_DATABASE_URL: str(),

  // Supabase project URL — used to fetch the Auth JWKS (JWT Signing Keys)
  // that verify the JWTs Supabase issues on sign-in
  SUPABASE_URL: url(),

  // URLs
  CLIENT_URL: url(),
  SERVER_URL: url(),
  CORS_ORIGIN: str(),
});
