import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { AppError } from "../middleware/errorHandler";
import { Exercise } from "../models/Exercise";
import { Workout } from "../models/Workout";
import { WorkoutExercise } from "../models/WorkoutExercise";
import { Set } from "../models/Set";

// Helper function to format workout data for export
const formatWorkoutData = async (userId: number, exerciseId?: number) => {
  const workouts = await Workout.findAll({
    where: { userId },
    include: [
      {
        model: Exercise,
        as: "exercises",
        ...(exerciseId ? { where: { id: exerciseId } } : {}),
        through: {
          model: WorkoutExercise,
          as: "workoutExercise",
          include: [
            {
              model: Set,
              as: "sets",
            },
          ],
        },
      },
    ],
    order: [["startTime", "DESC"]],
  });

  return workouts.map((workout) => ({
    name: workout.name || "Unnamed Workout",
    startTime: workout.startTime.toISOString().split("T")[0],
    endTime: workout.endTime?.toISOString().split("T")[0] || "In Progress",
    exercises: workout.exercises?.map((exercise) => ({
      name: exercise.name,
      sets: (exercise.workoutExercise as any).sets.map((set: Set) => ({
        weight: set.weight,
        reps: set.reps,
        notes: set.notes,
      })),
    })),
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

    // Flatten the data for CSV format
    const flattenedData = workoutData.flatMap(
      (workout) =>
        workout.exercises?.flatMap((exercise) =>
          exercise.sets.map((set, index) => ({
            workoutName: workout.name,
            date: workout.startTime,
            endTime: workout.endTime,
            exerciseName: exercise.name,
            setNumber: index + 1,
            weight: set.weight,
            reps: set.reps,
            notes: set.notes || "",
          }))
        ) || []
    );

    const fields = [
      "workoutName",
      "date",
      "endTime",
      "exerciseName",
      "setNumber",
      "weight",
      "reps",
      "notes",
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
        .text(workout.name)
        .fontSize(12)
        .text(`Date: ${workout.startTime}`)
        .text(`End Time: ${workout.endTime}`)
        .moveDown(0.5);

      // Add exercises
      workout.exercises?.forEach((exercise) => {
        doc.fontSize(14).text(exercise.name).moveDown(0.5);

        // Add sets table
        const setRows = exercise.sets.map((set, index) => [
          `Set ${index + 1}`,
          `${set.weight} kg`,
          `${set.reps} reps`,
          set.notes || "",
        ]);

        // Calculate column widths
        const colWidths = [60, 80, 80, 200];
        const tableTop = doc.y;
        let tableHeight = 0;

        // Draw headers
        ["Set", "Weight", "Reps", "Notes"].forEach((header, i) => {
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

      doc.moveDown(2);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
