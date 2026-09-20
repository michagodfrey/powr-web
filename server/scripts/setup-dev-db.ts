import { Pool } from "pg";
import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();

const setupDevDatabase = async () => {
  // Connection to postgres database to create the dev database
  const rootPool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: process.env.POSTGRES_PASSWORD,
    database: "postgres",
  });

  try {
    // 1. Create dev user if not exists
    await rootPool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'powr_dev') THEN
          CREATE USER powr_dev WITH PASSWORD '${process.env.DEV_DB_PASSWORD}';
        END IF;
      END $$;
    `);

    // 2. Create dev database if it doesn't already exist (never drop it —
    // unlike the test DB, this one holds data you actually want to keep
    // between runs)
    const { rows } = await rootPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'powr_dev';"
    );
    if (rows.length === 0) {
      await rootPool.query("CREATE DATABASE powr_dev WITH OWNER powr_dev;");
    }

    await rootPool.end();

    // 3. Connect to the dev database for remaining setup
    const devPool = new Pool({
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: process.env.POSTGRES_PASSWORD,
      database: "powr_dev",
    });

    // 4. Set up schema ownership/permissions (idempotent)
    await devPool.query(`
      GRANT ALL ON SCHEMA public TO powr_dev;

      ALTER DEFAULT PRIVILEGES FOR USER powr_dev IN SCHEMA public
      GRANT ALL ON TABLES TO powr_dev;

      ALTER DEFAULT PRIVILEGES FOR USER powr_dev IN SCHEMA public
      GRANT ALL ON SEQUENCES TO powr_dev;
    `);

    console.log("✅ Dev database setup completed successfully");
    console.log(
      "   Run `npm run setup:db` next to create the app's tables in it."
    );
    await devPool.end();
    exit(0);
  } catch (error) {
    console.error("❌ Error setting up dev database:", error);
    await rootPool.end();
    exit(1);
  }
};

setupDevDatabase();
