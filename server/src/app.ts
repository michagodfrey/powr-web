import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import pgSession from "connect-pg-simple";
import "./config/passport"; // Import passport config
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { Pool } from "pg";

// Validate required environment variables
if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL environment variable is required");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const app = express();

// Security headers middleware
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

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// PostgreSQL session store setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const PostgresqlStore = pgSession(session);
const sessionStore = new PostgresqlStore({
  pool,
  tableName: "user_sessions", // More descriptive table name
  createTableIfMissing: true,
  pruneSessionInterval: 24 * 60 * 60, // Prune expired sessions every 24 hours
});

// Session configuration
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days as per PRD
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined, // undefined for localhost
    },
    name: "powr.sid", // Custom session cookie name for better security
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/export", exportRoutes);

// Error handling
app.use(errorHandler);

export default app;
