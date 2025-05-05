// Express application setup with security and JWT configuration
import express from "express";
import cors from "cors";
import { config } from "./config/validateEnv";
import { pool } from "./config/database";
import { configurePassport } from "./config/passport";
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInput } from "./middleware/validation";

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

  // Trust the first proxy (Railway's load balancer)
  app.set("trust proxy", 1);

  // Essential middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeInput);

  // CORS configuration
  const allowedOrigins = [
    "https://powr-psi.vercel.app",
    "http://localhost:5173",
  ];

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

  // Simple health check
  app.get("/", (req, res) => {
    res.send("Backend is running. Go to https://powr-psi.vercel.app");
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

  // Configure Passport to serialize user for the session
  configurePassport();

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/export", exportRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
};
