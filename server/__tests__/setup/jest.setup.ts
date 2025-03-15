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
  // Initialize test database connection
  testDb = new Sequelize(config.DATABASE_URL, {
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

    // Create session table for connect-pg-simple
    await testDb.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("✅ Session table created");

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
  await testDb.query('TRUNCATE TABLE "session" CASCADE;');
});

// Add global test utilities
global.testDb = testDb;

// Mock authentication middleware for protected routes
jest.mock("../../src/middleware/auth", () => ({
  isAuthenticated: jest.fn(
    (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.headers["x-test-auth"]) {
          return res.status(401).json({
            status: "fail",
            message: "Please log in to access this resource",
          });
        }

        // Try to parse the auth header
        let authData;
        try {
          authData = JSON.parse(req.headers["x-test-auth"] as string);
        } catch (e) {
          return res.status(401).json({
            status: "fail",
            message: "Please log in to access this resource",
          });
        }

        // Validate auth data structure
        if (!authData || !authData.id || !authData.email) {
          return res.status(401).json({
            status: "fail",
            message: "Please log in to access this resource",
          });
        }

        // Check for session expiration
        if (authData.exp && authData.exp < Math.floor(Date.now() / 1000)) {
          return res.status(401).json({
            status: "fail",
            message: "Please log in to access this resource",
          });
        }

        // Check for session fixation
        const currentSession = req.headers["x-session-id"];
        if (currentSession && currentSession !== authData.sessionId) {
          return res.status(401).json({
            status: "fail",
            message: "Please log in to access this resource",
          });
        }

        req.user = authData;
        return next();
      } catch (error) {
        return res.status(401).json({
          status: "fail",
          message: "Please log in to access this resource",
        });
      }
    }
  ),
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
