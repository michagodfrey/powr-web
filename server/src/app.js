"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
require("./config/passport"); // Import passport config
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const pg_1 = require("pg");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
// PostgreSQL session store setup
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});
const PostgresqlStore = (0, connect_pg_simple_1.default)(express_session_1.default);
const sessionStore = new PostgresqlStore({
    pool,
    tableName: "session",
    createTableIfMissing: true,
});
// Session configuration
app.use((0, express_session_1.default)({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        sameSite: "lax",
    },
}));
// Initialize Passport and restore authentication state from session
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/exercises", exerciseRoutes_1.default);
app.use("/api/workouts", workoutRoutes_1.default);
app.use("/api/export", exportRoutes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
