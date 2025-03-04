"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkoutSession = exports.updateWorkoutSession = exports.getWorkoutSessions = exports.createWorkoutSession = void 0;
const sequelize_1 = require("sequelize");
const errorHandler_1 = require("../middleware/errorHandler");
const WorkoutSession_1 = __importDefault(require("../models/WorkoutSession"));
const Exercise_1 = __importDefault(require("../models/Exercise"));
// Calculate total volume for a set of exercises
const calculateTotalVolume = (sets) => {
    return sets.reduce((total, set) => {
        const weight = set.unit === "lb" ? set.weight * 0.453592 : set.weight; // Convert to kg if needed
        return total + weight * set.reps;
    }, 0);
};
// Create a new workout session
const createWorkoutSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exerciseId, date, sets } = req.body;
        const userId = req.user.id;
        // Verify exercise belongs to user
        const exercise = yield Exercise_1.default.findOne({
            where: { id: exerciseId, userId },
        });
        if (!exercise) {
            throw new errorHandler_1.AppError("Exercise not found", 404);
        }
        const totalVolume = calculateTotalVolume(sets);
        const workoutSession = yield WorkoutSession_1.default.create({
            userId,
            exerciseId,
            date: new Date(date),
            sets,
            totalVolume,
        });
        res.status(201).json({
            status: "success",
            data: {
                workoutSession,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createWorkoutSession = createWorkoutSession;
// Get workout sessions for an exercise
const getWorkoutSessions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exerciseId } = req.params;
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        // Verify exercise belongs to user
        const exercise = yield Exercise_1.default.findOne({
            where: { id: exerciseId, userId },
        });
        if (!exercise) {
            throw new errorHandler_1.AppError("Exercise not found", 404);
        }
        // Build date filter if provided
        const dateFilter = {};
        if (startDate && endDate) {
            Object.assign(dateFilter, {
                date: {
                    [sequelize_1.Op.between]: [
                        new Date(startDate),
                        new Date(endDate),
                    ],
                },
            });
        }
        const workoutSessions = yield WorkoutSession_1.default.findAll({
            where: Object.assign({ userId,
                exerciseId }, dateFilter),
            order: [["date", "DESC"]],
        });
        res.json({
            status: "success",
            data: {
                workoutSessions,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getWorkoutSessions = getWorkoutSessions;
// Update a workout session
const updateWorkoutSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { date, sets } = req.body;
        const userId = req.user.id;
        const workoutSession = yield WorkoutSession_1.default.findOne({
            where: { id, userId },
        });
        if (!workoutSession) {
            throw new errorHandler_1.AppError("Workout session not found", 404);
        }
        yield workoutSession.update({
            date: date ? new Date(date) : workoutSession.date,
            sets: sets || workoutSession.sets,
        });
        res.json({
            status: "success",
            data: {
                workoutSession,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateWorkoutSession = updateWorkoutSession;
// Delete a workout session
const deleteWorkoutSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const workoutSession = yield WorkoutSession_1.default.findOne({
            where: { id, userId },
        });
        if (!workoutSession) {
            throw new errorHandler_1.AppError("Workout session not found", 404);
        }
        yield workoutSession.destroy();
        res.json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteWorkoutSession = deleteWorkoutSession;
