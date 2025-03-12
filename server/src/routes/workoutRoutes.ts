import express from "express";
import * as workoutController from "../controllers/workoutController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create a new workout
router.post("/", workoutController.createWorkout);

// Get workouts (with optional exercise filter)
router.get("/:exerciseId?", workoutController.getWorkouts);

// Get a specific workout
router.get("/workout/:id", workoutController.getWorkout);

// Update a workout
router.put("/:id", workoutController.updateWorkout);

// Delete a workout
router.delete("/:id", workoutController.deleteWorkout);

export default router;
