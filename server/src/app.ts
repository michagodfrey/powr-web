import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import { config } from "./config/validateEnv";
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";

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

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS configuration
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // PostgreSQL session store setup with error handling
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl:
      config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  const PostgresqlStore = pgSession(session);
  const sessionStore = new PostgresqlStore({
    pool,
    tableName: "sessions", // Match the table name from our schema
    createTableIfMissing: true,
    pruneSessionInterval: 24 * 60 * 60, // Prune expired sessions every 24 hours
  });

  // Handle session store errors
  sessionStore.on("error", (error: Error) => {
    console.error("Session store error:", error);
    // Don't exit process, but log the error
  });

  // Session configuration as per security-requirements.md
  app.use(
    session({
      store: sessionStore,
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true, // Refresh session with each request
      cookie: {
        secure: config.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days as per PRD
        sameSite: "lax",
        domain:
          config.NODE_ENV === "production" ? config.COOKIE_DOMAIN : undefined,
      },
      name: "powr.sid", // Custom session cookie name for better security
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(configuredPassport.initialize());
  app.use(configuredPassport.session());

  // Add authentication debugging middleware in development
  if (config.NODE_ENV === "development") {
    app.use((req, res, next) => {
      console.log("Auth Debug:", {
        path: req.path,
        method: req.method,
        isAuthenticated: req.isAuthenticated(),
        sessionID: req.sessionID,
        user: req.user,
        cookies: req.cookies,
        sessionCookie: req.cookies["powr.sid"],
      });
      next();
    });
  }

  // Add request logging in development
  if (config.NODE_ENV === "development") {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/export", exportRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
};
