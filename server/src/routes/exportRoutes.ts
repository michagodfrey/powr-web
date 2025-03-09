import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  exportWorkoutsCSV,
  exportWorkoutsPDF,
} from "../controllers/exportController";

const router = express.Router();

// Protect all routes in this router
router.use(isAuthenticated);

// Export workout data as CSV
router.get("/csv", exportWorkoutsCSV);

// Export workout data as PDF
router.get("/pdf", exportWorkoutsPDF);

export default router;
