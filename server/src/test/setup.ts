import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.join(__dirname, "../../.env.test") });

// Import models
import User from "../models/User";
import Exercise from "../models/Exercise";
import WorkoutSession from "../models/WorkoutSession";

// Global test setup
beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes("test")) {
    throw new Error("Must use test database for testing!");
  }

  // Sync database - this will create tables if they don't exist
  await User.sync({ force: true });
  await Exercise.sync({ force: true });
  await WorkoutSession.sync({ force: true });
});

// Global test teardown
afterAll(async () => {
  // Clean up database
  await WorkoutSession.destroy({ where: {} });
  await Exercise.destroy({ where: {} });
  await User.destroy({ where: {} });
});

// Reset database between tests if needed
afterEach(async () => {
  // Clean up after each test
  await WorkoutSession.destroy({ where: {} });
  await Exercise.destroy({ where: {} });
  await User.destroy({ where: {} });
});
