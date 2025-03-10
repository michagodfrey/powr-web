import { Request, Response, NextFunction } from "express";
import { Exercise } from "../models/Exercise";
import { AppError } from "../middleware/errorHandler";

// Create a new exercise
export const createExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const userId = (req.user as any).id;

    const exercise = await Exercise.create({
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
    const userId = (req.user as any).id;

    const exercises = await Exercise.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "success",
      data: {
        exercises,
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
    const userId = (req.user as any).id;

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
    const userId = (req.user as any).id;

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
    const userId = (req.user as any).id;

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
