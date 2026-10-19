// Applies the incremental SQL migrations in scripts/migrations, in filename order
// Unlike setup:db (which drops and recreates every table), these preserve data,
// and each file is written to be idempotent so re-running them is harmless
import { pool } from "../config/database";
import fs from "fs";
import path from "path";

async function migrate() {
  const migrationsDir = path.join(__dirname, "../../scripts/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log("Migrations complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { migrate };
