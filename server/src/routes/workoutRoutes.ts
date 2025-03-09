import express from "express";
import * as workoutController from "../controllers/workoutController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create a new workout session
router.post("/", workoutController.createWorkoutSession);

// Get workout sessions for an exercise
router.get("/:exerciseId", workoutController.getWorkoutSessions);

// Update a workout session
router.put("/:id", workoutController.updateWorkoutSession);

// Delete a workout session
router.delete("/:id", workoutController.deleteWorkoutSession);

export default router;
