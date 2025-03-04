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
exports.exportWorkoutsPDF = exports.exportWorkoutsCSV = void 0;
const json2csv_1 = require("json2csv");
const pdfkit_1 = __importDefault(require("pdfkit"));
const Exercise_1 = __importDefault(require("../models/Exercise"));
const WorkoutSession_1 = __importDefault(require("../models/WorkoutSession"));
// Helper function to format workout data for export
const formatWorkoutData = (userId, exerciseId) => __awaiter(void 0, void 0, void 0, function* () {
    const where = exerciseId ? { userId, exerciseId } : { userId };
    const workouts = yield WorkoutSession_1.default.findAll({
        where,
        include: [
            {
                model: Exercise_1.default,
                attributes: ["name"],
                as: "exercise",
            },
        ],
        order: [["date", "DESC"]],
    });
    return workouts.map((workout) => {
        var _a;
        return ({
            exerciseName: ((_a = workout.exercise) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Exercise",
            date: workout.date.toISOString().split("T")[0],
            sets: workout.sets,
            totalVolume: workout.totalVolume,
        });
    });
});
// Export workout data as CSV
const exportWorkoutsCSV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { exerciseId } = req.query;
        const workoutData = yield formatWorkoutData(userId, exerciseId ? Number(exerciseId) : undefined);
        // Flatten the sets array for CSV format
        const flattenedData = workoutData.flatMap((workout) => workout.sets.map((set, index) => ({
            exerciseName: workout.exerciseName,
            date: workout.date,
            setNumber: index + 1,
            weight: set.weight,
            reps: set.reps,
            unit: set.unit,
            totalVolume: workout.totalVolume,
        })));
        const fields = [
            "exerciseName",
            "date",
            "setNumber",
            "weight",
            "reps",
            "unit",
            "totalVolume",
        ];
        const json2csvParser = new json2csv_1.Parser({ fields });
        const csv = json2csvParser.parse(flattenedData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=workouts-${new Date().toISOString().split("T")[0]}.csv`);
        res.send(csv);
    }
    catch (error) {
        next(error);
    }
});
exports.exportWorkoutsCSV = exportWorkoutsCSV;
// Export workout data as PDF
const exportWorkoutsPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { exerciseId } = req.query;
        const workoutData = yield formatWorkoutData(userId, exerciseId ? Number(exerciseId) : undefined);
        const doc = new pdfkit_1.default();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=workouts-${new Date().toISOString().split("T")[0]}.pdf`);
        doc.pipe(res);
        // Add title
        doc.fontSize(20).text("Workout History", { align: "center" }).moveDown();
        // Add workout data
        workoutData.forEach((workout) => {
            doc
                .fontSize(16)
                .text(workout.exerciseName)
                .fontSize(12)
                .text(`Date: ${workout.date}`)
                .text(`Total Volume: ${workout.totalVolume.toFixed(2)} kg`)
                .moveDown(0.5);
            // Add sets table
            const setRows = workout.sets.map((set, index) => [
                `Set ${index + 1}`,
                `${set.weight} ${set.unit}`,
                `${set.reps} reps`,
            ]);
            // Calculate column widths
            const colWidths = [100, 100, 100];
            const tableTop = doc.y;
            let tableHeight = 0;
            // Draw headers
            ["Set", "Weight", "Reps"].forEach((header, i) => {
                doc.text(header, doc.x + i * colWidths[i], tableTop);
            });
            // Draw rows
            setRows.forEach((row, i) => {
                const rowTop = tableTop + 20 + i * 20;
                row.forEach((cell, j) => {
                    doc.text(cell, doc.x + j * colWidths[j], rowTop);
                });
                tableHeight = Math.max(tableHeight, rowTop - tableTop + 20);
            });
            doc.moveDown(2);
        });
        doc.end();
    }
    catch (error) {
        next(error);
    }
});
exports.exportWorkoutsPDF = exportWorkoutsPDF;
