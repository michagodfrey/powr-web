// Vercel serverless entrypoint. Unlike src/index.ts (local dev, app.listen),
// this never binds a port — Vercel calls the exported handler per request.
// initDatabase() is memoized so it only runs once per warm container, not
// on every invocation.
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app";
import { initDatabase } from "../src/config/database";

const app = createApp();

let dbReady: Promise<unknown> | null = null;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!dbReady) {
    dbReady = initDatabase().catch((error) => {
      dbReady = null; // allow the next invocation to retry
      throw error;
    });
  }

  try {
    await dbReady;
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database unavailable" });
    return;
  }

  app(req as any, res as any);
};
