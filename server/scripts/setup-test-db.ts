import { Pool } from "pg";
import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();

const setupTestDatabase = async () => {
  // Connection to postgres database to create test database
  const rootPool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: process.env.POSTGRES_PASSWORD,
    database: "postgres",
  });

  try {
    // 1. Create test user if not exists
    await rootPool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'powr_test') THEN
          CREATE USER powr_test WITH PASSWORD '${process.env.TEST_DB_PASSWORD}';
        END IF;
      END $$;
    `);

    // 2. Drop test database if exists and recreate
    await rootPool.query("DROP DATABASE IF EXISTS powr_test;");
    await rootPool.query("CREATE DATABASE powr_test WITH OWNER powr_test;");

    // Close root pool connection
    await rootPool.end();

    // 3. Connect to test database for remaining operations
    const testPool = new Pool({
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: process.env.POSTGRES_PASSWORD,
      database: "powr_test",
    });

    // 4. Set up schema and permissions
    await testPool.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public AUTHORIZATION powr_test;
      
      GRANT ALL ON SCHEMA public TO powr_test;
      
      ALTER DEFAULT PRIVILEGES FOR USER powr_test IN SCHEMA public
      GRANT ALL ON TABLES TO powr_test;
      
      ALTER DEFAULT PRIVILEGES FOR USER powr_test IN SCHEMA public
      GRANT ALL ON SEQUENCES TO powr_test;
    `);

    console.log("✅ Test database setup completed successfully");
    await testPool.end();
    exit(0);
  } catch (error) {
    console.error("❌ Error setting up test database:", error);
    await rootPool.end();
    exit(1);
  }
};

setupTestDatabase();
