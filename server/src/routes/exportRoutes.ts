import express from "express";
import passport from "passport";
import {
  exportWorkoutsCSV,
  exportWorkoutsPDF,
} from "../controllers/exportController";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";

const router = express.Router();

// Protect all routes with error handling
router.use(async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        (err: Error | null, user: User | false) => {
          if (err) {
            return reject(err);
          }
          if (!user) {
            return reject(new AppError("Authentication failed", 401));
          }
          req.user = user;
          resolve(user);
        }
      )(req, res, next);
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Export workout data as CSV
router.get("/csv", exportWorkoutsCSV);

// Export workout data as PDF
router.get("/pdf", exportWorkoutsPDF);

export default router;
