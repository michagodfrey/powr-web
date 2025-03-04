"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/exercises", exerciseRoutes_1.default);
app.use("/api/workouts", workoutRoutes_1.default);
app.use("/api/export", exportRoutes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
