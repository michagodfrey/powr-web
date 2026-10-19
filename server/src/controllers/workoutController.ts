// Workout controller handling CRUD operations for workout sessions
// Manages workout tracking with set management and volume calculations
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AppError } from "../middleware/errorHandler";
import { Exercise } from "../models/Exercise";
import { WorkoutSession } from "../models/WorkoutSession";
import { Set } from "../models/Set";
import { buildSetsForExercise } from "../utils/exerciseMetrics";

const SET_ATTRIBUTES = [
  "weight",
  "reps",
  "durationSeconds",
  "notes",
  "unit",
  "volume",
  "setNumber",
];

// Create a new workout
export const createWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("[Workout] Create workout request:", {
      path: req.path,
      method: req.method,
      user: req.jwtUser,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    const { exerciseId, date, sets } = req.body;
    const userId = req.jwtUser?.id;
    if (!userId) throw new AppError("Authentication required", 401);

    // Verify exercise belongs to user
    const exercise = await Exercise.findOne({
      where: { id: exerciseId, userId },
    });

    if (!exercise) {
      console.error("[Workout] Exercise not found or doesn't belong to user:", {
        exerciseId,
        userId,
        timestamp: new Date().toISOString(),
      });
      throw new AppError("Exercise not found", 404);
    }

    console.log("[Workout] Exercise verified:", {
      exerciseId: exercise.id,
      userId: exercise.userId,
      timestamp: new Date().toISOString(),
    });

    // Keep the fields this exercise type uses, calculate the session total,
    // and ensure all sets have units
    const unit = (req.jwtUser as any)?.preferredUnit || "kg";
    const { sets: setsWithVolume, total: totalVolume } = buildSetsForExercise(
      exercise.exerciseType,
      sets,
      unit
    );

    console.log("[Workout] Calculated volume:", {
      totalVolume,
      setsCount: sets.length,
      timestamp: new Date().toISOString(),
    });

    // Create workout session
    const workoutSession = await WorkoutSession.create({
      userId,
      exerciseId,
      date: new Date(date),
      notes: req.body.notes,
      totalVolume,
      unit,
    });

    console.log("[Workout] Created workout session:", {
      sessionId: workoutSession.id,
      userId,
      exerciseId,
      timestamp: new Date().toISOString(),
    });

    // Create sets
    await Promise.all(
      setsWithVolume.map((setData) =>
        Set.create({ ...setData, sessionId: workoutSession.id })
      )
    );

    console.log("[Workout] Created sets:", {
      sessionId: workoutSession.id,
      setsCount: setsWithVolume.length,
      timestamp: new Date().toISOString(),
    });

    // Fetch complete workout session with sets
    const completeSession = await WorkoutSession.findByPk(workoutSession.id, {
      include: [
        {
          model: Set,
          as: "sets",
          attributes: SET_ATTRIBUTES,
        },
      ],
    });

    // Convert totalVolume to number before sending response
    const response = {
      ...completeSession?.toJSON(),
      totalVolume: completeSession?.totalVolumeAsNumber || 0,
    };

    console.log("[Workout] Sending response:", {
      sessionId: workoutSession.id,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      status: "success",
      data: {
        workoutSession: response,
      },
    });
  } catch (error) {
    console.error("[Workout] Error in createWorkout:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
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
    const userId = req.jwtUser?.id;
    if (!userId) throw new AppError("Authentication required", 401);
    const { startDate, endDate } = req.query;

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
        ...dateFilter,
      },
      include: [
        {
          model: Exercise,
          as: "exercise",
        },
        {
          model: Set,
          as: "sets",
          attributes: SET_ATTRIBUTES,
        },
      ],
      order: [["date", "DESC"]],
    });

    // Convert totalVolume to number for each session
    const response = workoutSessions.map((session) => ({
      ...session.toJSON(),
      totalVolume: session.totalVolumeAsNumber,
    }));

    res.json({
      status: "success",
      data: {
        workoutSessions: response,
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
    const userId = req.jwtUser?.id;
    if (!userId) throw new AppError("Authentication required", 401);

    const workoutSession = await WorkoutSession.findOne({
      where: { id, userId },
      include: [
        {
          model: Exercise,
          as: "exercise",
        },
        {
          model: Set,
          as: "sets",
          attributes: SET_ATTRIBUTES,
        },
      ],
    });

    if (!workoutSession) {
      throw new AppError("Workout session not found", 404);
    }

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

// Update a workout
export const updateWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { date, notes, sets } = req.body;
    const userId = req.jwtUser?.id;
    if (!userId) throw new AppError("Authentication required", 401);

    const workoutSession = await WorkoutSession.findOne({
      where: { id, userId },
    });

    if (!workoutSession) {
      throw new AppError("Workout session not found", 404);
    }

    // Update session details
    if (date || notes) {
      await workoutSession.update({
        date: date ? new Date(date) : workoutSession.date,
        notes: notes || workoutSession.notes,
      });
    }

    // Update sets if provided
    if (sets && sets.length > 0) {
      const exercise = await Exercise.findByPk(workoutSession.exerciseId);
      if (!exercise) {
        throw new AppError("Exercise not found", 404);
      }

      // Calculate new total before touching existing sets, so an invalid
      // payload can't leave the session with its sets deleted
      const { sets: setsWithVolume, total: totalVolume } = buildSetsForExercise(
        exercise.exerciseType,
        sets,
        workoutSession.unit
      );

      // Delete existing sets
      await Set.destroy({
        where: { sessionId: workoutSession.id },
      });

      // Create new sets
      await Promise.all(
        setsWithVolume.map((setData) =>
          Set.create({ ...setData, sessionId: workoutSession.id })
        )
      );

      // Update total volume
      await workoutSession.update({ totalVolume });
    }

    // Fetch updated workout session
    const updatedSession = await WorkoutSession.findByPk(workoutSession.id, {
      include: [
        {
          model: Exercise,
          as: "exercise",
        },
        {
          model: Set,
          as: "sets",
          attributes: SET_ATTRIBUTES,
        },
      ],
    });

    // Convert totalVolume to number before sending response
    const response = {
      ...updatedSession?.toJSON(),
      totalVolume: updatedSession?.totalVolumeAsNumber || 0,
    };

    res.json({
      status: "success",
      data: {
        workoutSession: response,
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
    const userId = req.jwtUser?.id;
    if (!userId) throw new AppError("Authentication required", 401);

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

// Get workouts for a specific exercise
export const getWorkoutsByExercise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.jwtUser?.id;
    if (!userId) throw new AppError("Authentication required", 401);

    // Verify exercise belongs to user
    const exercise = await Exercise.findOne({
      where: { id: exerciseId, userId },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", 404);
    }

    const workoutSessions = await WorkoutSession.findAll({
      where: {
        userId,
        exerciseId,
      },
      include: [
        {
          model: Set,
          as: "sets",
          attributes: SET_ATTRIBUTES,
        },
      ],
      order: [["date", "DESC"]],
    });

    // Convert totalVolume to number for each session
    const response = workoutSessions.map((session) => ({
      ...session.toJSON(),
      totalVolume: session.totalVolumeAsNumber,
    }));

    res.json({
      status: "success",
      data: {
        workoutSessions: response,
      },
    });
  } catch (error) {
    next(error);
  }
};
