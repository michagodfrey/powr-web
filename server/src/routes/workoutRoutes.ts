// Protected routes for managing workout sessions and history
// Handles CRUD operations for workouts with validation and exercise association
import { Router } from "express";
import { validateJWT } from "../middleware/auth";
import { validateWorkoutInput } from "../middleware/validation";
import {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutsByExercise,
} from "../controllers/workoutController";

const router = Router();

// Apply authentication middleware to all routes
router.use(validateJWT );

router.route("/").get(getWorkouts).post(validateWorkoutInput, createWorkout);

router
  .route("/:id")
  .get(getWorkout)
  .put(validateWorkoutInput, updateWorkout)
  .delete(deleteWorkout);

// Get workouts for a specific exercise
router.get("/exercise/:exerciseId", getWorkoutsByExercise);

export default router;
