// Exercise controller handling CRUD operations for exercises
// Manages user's exercise library with validation and error handling
import { Request, Response, NextFunction } from "express";
import { Exercise } from "../models/Exercise";
import { WorkoutSession } from "../models/WorkoutSession";
import { AppError } from "../middleware/errorHandler";

// Create a new exercise
export const createExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    if (!req.jwtUser) {
      throw new AppError("Not authenticated", 401);
    }
    const userId = req.jwtUser.id;

    const exercise = await Exercise.create({
      name,
      description,
      userId,
      isArchived: false,
    });

    res.status(201).json({
      status: "success",
      data: {
        exercise,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all exercises for the user
export const getExercises = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.jwtUser) {
      throw new AppError("Not authenticated", 401);
    }
    const userId = req.jwtUser.id;

    const exercises = await Exercise.findAll({
      where: { userId },
      include: [
        {
          model: WorkoutSession,
          as: "workoutSessions",
          attributes: ["id"], // Only fetch IDs to keep response light
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform the response to match the expected format
    const transformedExercises = exercises.map((exercise) => {
      const exerciseJson = exercise.toJSON();
      return {
        ...exerciseJson,
        workoutHistory: exerciseJson.workoutSessions || [],
      };
    });

    res.json({
      status: "success",
      data: {
        exercises: transformedExercises,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific exercise
export const getExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!req.jwtUser) {
      throw new AppError("Not authenticated", 401);
    }
    const userId = req.jwtUser.id;

    const exercise = await Exercise.findOne({
      where: { id, userId },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", 404);
    }

    res.json({
      status: "success",
      data: {
        exercise,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update an exercise
export const updateExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!req.jwtUser) {
      throw new AppError("Not authenticated", 401);
    }
    const userId = req.jwtUser.id;

    const exercise = await Exercise.findOne({
      where: { id, userId },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", 404);
    }

    await exercise.update({
      name: name || exercise.name,
      description: description || exercise.description,
    });

    res.json({
      status: "success",
      data: {
        exercise,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an exercise
export const deleteExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!req.jwtUser) {
      throw new AppError("Not authenticated", 401);
    }
    const userId = req.jwtUser.id;

    const exercise = await Exercise.findOne({
      where: { id, userId },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", 404);
    }

    await exercise.destroy();

    res.json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
