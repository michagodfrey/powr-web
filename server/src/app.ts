// Express application setup with security, session, and authentication configuration
// Configures middleware, routes, and error handling for the API server
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import pgSession from "connect-pg-simple";
import { config } from "./config/validateEnv";
import { pool } from "./config/database";
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInput } from "./middleware/validation";
import cookieParser from "cookie-parser";

export const createApp = (configuredPassport: typeof passport) => {
  const app = express();

  // Security headers middleware as per security-requirements.md
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
  app.use(cookieParser(config.SESSION_SECRET));
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
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposedHeaders: ["Set-Cookie"],
    })
  );

  const PostgresqlStore = pgSession(session);
  const sessionStore = new PostgresqlStore({
    pool,
    tableName: "session",
    createTableIfMissing: true,
    pruneSessionInterval: 24 * 60 * 60, // Prune expired sessions every 24 hours
  });

  // Handle session store errors
  sessionStore.on("error", (error: Error) => {
    console.error("Session store error:", error);
    // Don't exit process, but log the error
  });

  // Session configuration
  const cookieSettings = {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    path: "/",
    ...(config.NODE_ENV === "production"
      ? {
          secure: true,
          sameSite: "none" as const,
          ...(config.COOKIE_DOMAIN && {
            domain: config.COOKIE_DOMAIN.startsWith(".")
              ? config.COOKIE_DOMAIN
              : `.${config.COOKIE_DOMAIN}`,
          }),
        }
      : {
          secure: false,
          sameSite: "lax" as const,
        }),
  };

  app.use(
    session({
      store: sessionStore,
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      proxy: config.NODE_ENV === "production",
      cookie: cookieSettings,
      name: "powr.sid",
      unset: "destroy", // Properly remove session on logout
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(configuredPassport.initialize());
  app.use(configuredPassport.session());

  // Add request logging in development
  if (config.NODE_ENV === "development") {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, {
        isAuthenticated: req.isAuthenticated(),
        sessionID: req.sessionID,
        user: req.user,
      });
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

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/export", exportRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
};
