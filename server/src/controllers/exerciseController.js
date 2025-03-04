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
exports.deleteExercise = exports.updateExercise = exports.getExercise = exports.getExercises = exports.createExercise = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Exercise_1 = __importDefault(require("../models/Exercise"));
// Create a new exercise
const createExercise = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;
        const exercise = yield Exercise_1.default.create({
            name,
            description,
            userId,
        });
        res.status(201).json({
            status: "success",
            data: {
                exercise,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createExercise = createExercise;
// Get all exercises for the user
const getExercises = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const exercises = yield Exercise_1.default.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });
        res.json({
            status: "success",
            data: {
                exercises,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getExercises = getExercises;
// Get a specific exercise
const getExercise = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const exercise = yield Exercise_1.default.findOne({
            where: { id, userId },
        });
        if (!exercise) {
            throw new errorHandler_1.AppError("Exercise not found", 404);
        }
        res.json({
            status: "success",
            data: {
                exercise,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getExercise = getExercise;
// Update an exercise
const updateExercise = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user.id;
        const exercise = yield Exercise_1.default.findOne({
            where: { id, userId },
        });
        if (!exercise) {
            throw new errorHandler_1.AppError("Exercise not found", 404);
        }
        yield exercise.update({
            name: name || exercise.name,
            description: description || exercise.description,
        });
        res.json({
            status: "success",
            data: {
                exercise,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateExercise = updateExercise;
// Delete an exercise
const deleteExercise = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const exercise = yield Exercise_1.default.findOne({
            where: { id, userId },
        });
        if (!exercise) {
            throw new errorHandler_1.AppError("Exercise not found", 404);
        }
        yield exercise.destroy();
        res.json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteExercise = deleteExercise;
