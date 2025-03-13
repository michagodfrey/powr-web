import express from "express";
import * as workoutController from "../controllers/workoutController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get workouts for a specific exercise
router.get("/exercise/:exerciseId", workoutController.getWorkoutsByExercise);

// Create a new workout
router.post("/", workoutController.createWorkout);

// Get a specific workout
router.get("/:id", workoutController.getWorkout);

// Get all workouts
router.get("/", workoutController.getWorkouts);

// Update a workout
router.put("/:id", workoutController.updateWorkout);

// Delete a workout
router.delete("/:id", workoutController.deleteWorkout);

export default router;
