import express from "express";
import { isAuthenticated } from "../middleware/auth";
import * as exerciseController from "../controllers/exerciseController";

const router = express.Router();

// Protect all routes in this router
router.use(isAuthenticated);

// Create a new exercise
router.post("/", exerciseController.createExercise);

// Get all exercises for the user
router.get("/", exerciseController.getExercises);

// Get a specific exercise
router.get("/:id", exerciseController.getExercise);

// Update an exercise
router.put("/:id", exerciseController.updateExercise);

// Delete an exercise
router.delete("/:id", exerciseController.deleteExercise);

export default router;
