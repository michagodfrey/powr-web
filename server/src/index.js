"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
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
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
// Initialize Passport
app.use(passport_1.default.initialize());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/exercises", exerciseRoutes_1.default);
app.use("/api/workouts", workoutRoutes_1.default);
app.use("/api/export", exportRoutes_1.default);
// Error handling middleware must be after all routes
app.use((err, req, res, next) => {
    (0, errorHandler_1.errorHandler)(err, req, res, next);
});
// Start server
const PORT = process.env.PORT || 4000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize database connection
        yield (0, database_1.initDatabase)();
        // Start listening
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});
startServer();
