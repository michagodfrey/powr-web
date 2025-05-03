// Protected routes for exporting workout data in different formats
// Supports CSV and PDF export with authentication checks
import express from "express";
import { validateJWT } from "../middleware/auth";
import {
  exportWorkoutsCSV,
  exportWorkoutsPDF,
} from "../controllers/exportController";

const router = express.Router();

// Protect all routes in this router
router.use(validateJWT);

// Export workout data as CSV
router.get("/csv", exportWorkoutsCSV);

// Export workout data as PDF
router.get("/pdf", exportWorkoutsPDF);

export default router;
