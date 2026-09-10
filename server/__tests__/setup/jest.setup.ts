import { Sequelize } from "sequelize";
import { config } from "../../src/config/validateEnv";
import { initializeModels } from "../../src/models";
import "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { User } from "../../src/models/User";
import { Exercise } from "../../src/models/Exercise";
import { WorkoutSession } from "../../src/models/WorkoutSession";
import { Set } from "../../src/models/Set";

// Declare global test database
declare global {
  // eslint-disable-next-line no-var
  var testDb: Sequelize | null;
}

// Test database instance
let testDb: Sequelize | null = null;

beforeAll(async () => {
  // Initialize test database connection — TEST_DATABASE_URL, never
  // DATABASE_URL, so the test suite can never drop/truncate real data
  testDb = new Sequelize(config.TEST_DATABASE_URL, {
    logging: false, // Disable logging in tests
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  try {
    // Test database connection
    await testDb.authenticate();
    console.log("✅ Connected to test database");

    // Initialize models
    initializeModels(testDb);

    // Drop all tables first to ensure clean state
    await testDb.drop({ cascade: true });

    // Sync models with database in correct order
    await User.sync({ force: true });
    console.log("✅ Users table created");

    await Exercise.sync({ force: true });
    console.log("✅ Exercises table created");

    await WorkoutSession.sync({ force: true });
    console.log("✅ WorkoutSessions table created");

    await Set.sync({ force: true });
    console.log("✅ Sets table created");

    console.log("✅ Test database synced");
  } catch (error) {
    console.error("❌ Unable to connect to test database:", error);
    throw error;
  }
});

afterAll(async () => {
  // Close database connection
  if (testDb) {
    await testDb.close();
    console.log("✅ Test database connection closed");
  }
});

beforeEach(async () => {
  if (!testDb) {
    throw new Error("Test database not initialized");
  }
  // Clear all tables before each test
  await Set.destroy({ truncate: true, cascade: true });
  await WorkoutSession.destroy({ truncate: true, cascade: true });
  await Exercise.destroy({ truncate: true, cascade: true });
  await User.destroy({ truncate: true, cascade: true });
});

// Add global test utilities
global.testDb = testDb;

// Mock the Supabase-JWT-verifying middleware for protected routes. Real auth
// (Supabase Auth issuing/refreshing tokens) is out of scope for these tests —
// this simulates "already authenticated as this user" via a test-only header,
// matching the real middleware's request shape (req.jwtUser).
jest.mock("../../src/middleware/auth", () => ({
  validateJWT: jest.fn((req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.headers["x-test-auth"]) {
        return res.status(401).json({
          status: "fail",
          message: "Please log in to access this resource",
        });
      }

      let authData;
      try {
        authData = JSON.parse(req.headers["x-test-auth"] as string);
      } catch (e) {
        return res.status(401).json({
          status: "fail",
          message: "Please log in to access this resource",
        });
      }

      if (!authData || !authData.id || !authData.email) {
        return res.status(401).json({
          status: "fail",
          message: "Please log in to access this resource",
        });
      }

      // Check for simulated token expiration
      if (authData.exp && authData.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({
          status: "fail",
          message: "Please log in to access this resource",
        });
      }

      // Check for simulated session fixation
      const currentSession = req.headers["x-session-id"];
      if (currentSession && currentSession !== authData.sessionId) {
        return res.status(401).json({
          status: "fail",
          message: "Please log in to access this resource",
        });
      }

      req.jwtUser = authData;
      return next();
    } catch (error) {
      return res.status(401).json({
        status: "fail",
        message: "Please log in to access this resource",
      });
    }
  }),
}));

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
