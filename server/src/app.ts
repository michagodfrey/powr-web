// Express application setup with security and JWT configuration
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { config } from "./config/validateEnv";
import { pool } from "./config/database";
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInput } from "./middleware/validation";

// Same image the client uses as its favicon (client/public/POWR-dumbell.webp)
const favicon = fs.readFileSync(
  path.join(__dirname, "../public/POWR-dumbell.webp")
);

export const createApp = () => {
  const app = express();

  // Security headers middleware
  if (config.NODE_ENV === "production") {
    app.use((req, res, next) => {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'"
      );
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      next();
    });
  }

  // Trust the first proxy (Vercel's edge network)
  app.set("trust proxy", 1);

  // Essential middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeInput);

  // CORS configuration — origins come from CORS_ORIGIN (comma-separated)
  const allowedOrigins = config.CORS_ORIGIN.split(",").map((origin) =>
    origin.trim()
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`[CORS] Rejected request from origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Add request logging in development
  if (config.NODE_ENV === "development") {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Serve the same favicon the client uses, instead of routing the browser's
  // automatic request through to the rest of the app (and its DB-dependent checks)
  app.get("/favicon.ico", (req, res) => {
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(favicon);
  });

  // Simple health check
  app.get("/", (req, res) => {
    res.send(`Backend is running. Go to ${config.CLIENT_URL}`);
  });

  // Database connection check
  app.get("/db-check", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json({ status: "success", time: result.rows[0].now });
    } catch (err: any) {
      console.error("DB Check Error:", err);
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: err.message,
      });
    }
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/export", exportRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
};
