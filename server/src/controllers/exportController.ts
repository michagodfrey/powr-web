import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { AppError } from "../middleware/errorHandler";
import Exercise from "../models/Exercise";
import WorkoutSession from "../models/WorkoutSession";

// Helper function to format workout data for export
const formatWorkoutData = async (userId: number, exerciseId?: number) => {
  const where = exerciseId ? { userId, exerciseId } : { userId };

  const workouts = await WorkoutSession.findAll({
    where,
    include: [
      {
        model: Exercise,
        attributes: ["name"],
        as: "exercise",
      },
    ],
    order: [["date", "DESC"]],
  });

  return workouts.map((workout) => ({
    exerciseName: workout.exercise?.name || "Unknown Exercise",
    date: workout.date.toISOString().split("T")[0],
    sets: workout.sets,
    totalVolume: workout.totalVolume,
  }));
};

// Export workout data as CSV
export const exportWorkoutsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).id;
    const { exerciseId } = req.query;

    const workoutData = await formatWorkoutData(
      userId,
      exerciseId ? Number(exerciseId) : undefined
    );

    // Flatten the sets array for CSV format
    const flattenedData = workoutData.flatMap((workout) =>
      workout.sets.map((set, index) => ({
        exerciseName: workout.exerciseName,
        date: workout.date,
        setNumber: index + 1,
        weight: set.weight,
        reps: set.reps,
        unit: set.unit,
        totalVolume: workout.totalVolume,
      }))
    );

    const fields = [
      "exerciseName",
      "date",
      "setNumber",
      "weight",
      "reps",
      "unit",
      "totalVolume",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(flattenedData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=workouts-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );

    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Export workout data as PDF
export const exportWorkoutsPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).id;
    const { exerciseId } = req.query;

    const workoutData = await formatWorkoutData(
      userId,
      exerciseId ? Number(exerciseId) : undefined
    );

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=workouts-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

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
  } catch (error) {
    next(error);
  }
};
