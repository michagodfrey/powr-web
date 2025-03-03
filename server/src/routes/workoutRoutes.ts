import express from "express";
import passport from "passport";
import {
  createWorkoutSession,
  getWorkoutSessions,
  updateWorkoutSession,
  deleteWorkoutSession,
} from "../controllers/workoutController";

const router = express.Router();

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));

// Create a new workout session
router.post("/", createWorkoutSession);

// Get workout sessions for an exercise
router.get("/exercise/:exerciseId", getWorkoutSessions);

// Update a workout session
router.put("/:id", updateWorkoutSession);

// Delete a workout session
router.delete("/:id", deleteWorkoutSession);

export default router;
