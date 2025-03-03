import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/export", exportRoutes);

// Error handling
app.use(errorHandler);

export default app;
