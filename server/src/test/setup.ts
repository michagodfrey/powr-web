import { sequelize } from "../config/database";
import { Sequelize } from "sequelize";

let testSequelize: Sequelize;

beforeAll(async () => {
  // Use test database URL from environment
  testSequelize = new Sequelize(process.env.TEST_DATABASE_URL!, {
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
    await testSequelize.authenticate();
    console.log("✅ Connected to test database");

    // Sync models with database
    await testSequelize.sync({ force: true });
    console.log("✅ Test database synced");
  } catch (error) {
    console.error("❌ Unable to connect to test database:", error);
    throw error;
  }
});

afterAll(async () => {
  // Close database connection
  await testSequelize.close();
});

beforeEach(async () => {
  // Clear all tables before each test
  const models = Object.values(testSequelize.models);
  for (const model of models) {
    await model.destroy({ truncate: true, cascade: true });
  }
});
