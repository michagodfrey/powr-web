import express from "express";
import passport from "passport";
import {
  exportWorkoutsCSV,
  exportWorkoutsPDF,
} from "../controllers/exportController";

const router = express.Router();

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));

// Export workout data as CSV
router.get("/csv", exportWorkoutsCSV);

// Export workout data as PDF
router.get("/pdf", exportWorkoutsPDF);

export default router;
