import { Sequelize } from "sequelize";
import { config } from "../../src/config/validateEnv";
import { initializeModels } from "../../src/models";
import "@jest/globals";
import { Request, Response, NextFunction } from "express";

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

    // Sync models with database
    await testDb.sync({ force: true });
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
  const models = Object.values(testDb.models);
  for (const model of models) {
    await model.destroy({ truncate: true, cascade: true });
  }
});

// Add global test utilities
global.testDb = testDb;

// Mock authentication middleware for protected routes
jest.mock("../../src/middleware/auth", () => ({
  isAuthenticated: jest.fn(
    (req: Request, res: Response, next: NextFunction) => {
      if (req.headers["x-test-auth"]) {
        const authData = JSON.parse(req.headers["x-test-auth"] as string);

        // Check for session expiration
        if (authData.exp && authData.exp < Math.floor(Date.now() / 1000)) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = authData;
        return next();
      }
      res.status(401).json({ message: "Unauthorized" });
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
