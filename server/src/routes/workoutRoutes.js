"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const workoutController_1 = require("../controllers/workoutController");
const router = express_1.default.Router();
// Protect all routes
router.use(passport_1.default.authenticate("jwt", { session: false }));
// Create a new workout session
router.post("/", workoutController_1.createWorkoutSession);
// Get workout sessions for an exercise
router.get("/exercise/:exerciseId", workoutController_1.getWorkoutSessions);
// Update a workout session
router.put("/:id", workoutController_1.updateWorkoutSession);
// Delete a workout session
router.delete("/:id", workoutController_1.deleteWorkoutSession);
exports.default = router;
