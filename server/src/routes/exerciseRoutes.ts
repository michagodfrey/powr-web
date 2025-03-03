import express from "express";
import passport from "passport";
import {
  createExercise,
  getExercises,
  getExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exerciseController";

const router = express.Router();

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));

// Create a new exercise
router.post("/", createExercise);

// Get all exercises for the user
router.get("/", getExercises);

// Get a specific exercise
router.get("/:id", getExercise);

// Update an exercise
router.put("/:id", updateExercise);

// Delete an exercise
router.delete("/:id", deleteExercise);

export default router;
