// Protected routes for managing user exercises
// Handles CRUD operations with input validation and authentication checks
import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { validateExerciseInput } from "../middleware/validation";
import {
  createExercise,
  getExercises,
  getExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exerciseController";

const router = Router();

// Protect all routes in this router
router.use(isAuthenticated);

router.route("/").get(getExercises).post(validateExerciseInput, createExercise);

router
  .route("/:id")
  .get(getExercise)
  .put(validateExerciseInput, updateExercise)
  .delete(deleteExercise);

export default router;
