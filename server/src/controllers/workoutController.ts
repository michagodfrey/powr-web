import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AppError } from "../middleware/errorHandler";
import { Workout } from "../models/Workout";
import { Exercise } from "../models/Exercise";
import { WorkoutExercise } from "../models/WorkoutExercise";
import { Set } from "../models/Set";

interface SetData {
  weight: number;
  reps: number;
  notes?: string;
}

interface WorkoutExerciseData {
  exerciseId: number;
  notes?: string;
  sets: SetData[];
}

// Create a new workout
export const createWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, notes, exercises } = req.body as {
      name?: string;
      notes?: string;
      exercises: WorkoutExerciseData[];
    };
    const userId = (req.user as any).id;

    // Create workout
    const workout = await Workout.create({
      userId,
      name,
      notes,
      startTime: new Date(),
    });

    // Add exercises and sets
    for (let i = 0; i < exercises.length; i++) {
      const exerciseData = exercises[i];

      // Verify exercise belongs to user
      const exercise = await Exercise.findOne({
        where: { id: exerciseData.exerciseId, userId },
      });

      if (!exercise) {
        throw new AppError(
          `Exercise ${exerciseData.exerciseId} not found`,
          404
        );
      }

      // Create workout exercise
      const workoutExercise = await WorkoutExercise.create({
        workoutId: workout.id,
        exerciseId: exercise.id,
        notes: exerciseData.notes,
        order: i,
      });

      // Create sets
      await Promise.all(
        exerciseData.sets.map((setData) =>
          Set.create({
            workoutExerciseId: workoutExercise.id,
            ...setData,
          })
        )
      );
    }

    // Fetch complete workout with exercises and sets
    const completeWorkout = await Workout.findByPk(workout.id, {
      include: [
        {
          model: Exercise,
          as: "exercises",
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
    });

    res.status(201).json({
      status: "success",
      data: {
        workout: completeWorkout,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all workouts for the user
export const getWorkouts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate } = req.query;

    // Build date filter if provided
    const dateFilter = {};
    if (startDate && endDate) {
      Object.assign(dateFilter, {
        startTime: {
          [Op.between]: [
            new Date(startDate as string),
            new Date(endDate as string),
          ],
        },
      });
    }

    const workouts = await Workout.findAll({
      where: {
        userId,
        ...dateFilter,
      },
      include: [
        {
          model: Exercise,
          as: "exercises",
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

    res.json({
      status: "success",
      data: {
        workouts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific workout
export const getWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    const workout = await Workout.findOne({
      where: { id, userId },
      include: [
        {
          model: Exercise,
          as: "exercises",
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
    });

    if (!workout) {
      throw new AppError("Workout not found", 404);
    }

    res.json({
      status: "success",
      data: {
        workout,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a workout
export const updateWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, notes, endTime } = req.body;
    const userId = (req.user as any).id;

    const workout = await Workout.findOne({
      where: { id, userId },
    });

    if (!workout) {
      throw new AppError("Workout not found", 404);
    }

    await workout.update({
      name: name || workout.name,
      notes: notes || workout.notes,
      endTime: endTime ? new Date(endTime) : workout.endTime,
    });

    // Fetch updated workout with all relations
    const updatedWorkout = await Workout.findByPk(workout.id, {
      include: [
        {
          model: Exercise,
          as: "exercises",
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
    });

    res.json({
      status: "success",
      data: {
        workout: updatedWorkout,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a workout
export const deleteWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    const workout = await Workout.findOne({
      where: { id, userId },
    });

    if (!workout) {
      throw new AppError("Workout not found", 404);
    }

    await workout.destroy();

    res.json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
