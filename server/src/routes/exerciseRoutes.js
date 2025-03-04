"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const exerciseController_1 = require("../controllers/exerciseController");
const router = express_1.default.Router();
// Protect all routes
router.use(passport_1.default.authenticate("jwt", { session: false }));
// Create a new exercise
router.post("/", exerciseController_1.createExercise);
// Get all exercises for the user
router.get("/", exerciseController_1.getExercises);
// Get a specific exercise
router.get("/:id", exerciseController_1.getExercise);
// Update an exercise
router.put("/:id", exerciseController_1.updateExercise);
// Delete an exercise
router.delete("/:id", exerciseController_1.deleteExercise);
exports.default = router;
