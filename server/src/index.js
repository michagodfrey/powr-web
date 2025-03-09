"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const models_1 = require("./models");
// Load environment variables
dotenv_1.default.config();
// Import passport config (must be after dotenv.config())
require("./config/passport");
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
// Session configuration
const PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use((0, express_session_1.default)({
    store: new PgSession({
        conObject: {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production"
                ? { rejectUnauthorized: false }
                : false,
        },
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
    },
}));
// Initialize passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/exercises", exerciseRoutes_1.default);
app.use("/api/workouts", workoutRoutes_1.default);
app.use("/api/export", exportRoutes_1.default);
// Error handling middleware must be after all routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});
// Start server
const PORT = process.env.PORT || 4000;
models_1.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
