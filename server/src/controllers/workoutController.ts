import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AppError } from "../middleware/errorHandler";
import WorkoutSession from "../models/WorkoutSession";
import Exercise from "../models/Exercise";

interface WorkoutSetData {
  weight: number;
  reps: number;
  unit: "kg" | "lb";
}

// Calculate total volume for a set of exercises
const calculateTotalVolume = (sets: WorkoutSetData[]): number => {
  return sets.reduce((total, set) => {
    const weight = set.unit === "lb" ? set.weight * 0.453592 : set.weight; // Convert to kg if needed
    return total + weight * set.reps;
  }, 0);
};

// Create a new workout session
export const createWorkoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { exerciseId, date, sets } = req.body;
    const userId = (req.user as any).id;

    // Verify exercise belongs to user
    const exercise = await Exercise.findOne({
      where: { id: exerciseId, userId },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", 404);
    }

    const totalVolume = calculateTotalVolume(sets);

    const workoutSession = await WorkoutSession.create({
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
  } catch (error) {
    next(error);
  }
};

// Get workout sessions for an exercise
export const getWorkoutSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { exerciseId } = req.params;
    const userId = (req.user as any).id;
    const { startDate, endDate } = req.query;

    // Verify exercise belongs to user
    const exercise = await Exercise.findOne({
      where: { id: exerciseId, userId },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", 404);
    }

    // Build date filter if provided
    const dateFilter = {};
    if (startDate && endDate) {
      Object.assign(dateFilter, {
        date: {
          [Op.between]: [
            new Date(startDate as string),
            new Date(endDate as string),
          ],
        },
      });
    }

    const workoutSessions = await WorkoutSession.findAll({
      where: {
        userId,
        exerciseId,
        ...dateFilter,
      },
      order: [["date", "DESC"]],
    });

    res.json({
      status: "success",
      data: {
        workoutSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a workout session
export const updateWorkoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { date, sets } = req.body;
    const userId = (req.user as any).id;

    const workoutSession = await WorkoutSession.findOne({
      where: { id, userId },
    });

    if (!workoutSession) {
      throw new AppError("Workout session not found", 404);
    }

    await workoutSession.update({
      date: date ? new Date(date) : workoutSession.date,
      sets: sets || workoutSession.sets,
    });

    res.json({
      status: "success",
      data: {
        workoutSession,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a workout session
export const deleteWorkoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    const workoutSession = await WorkoutSession.findOne({
      where: { id, userId },
    });

    if (!workoutSession) {
      throw new AppError("Workout session not found", 404);
    }

    await workoutSession.destroy();

    res.json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
