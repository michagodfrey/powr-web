// Workout controller handling CRUD operations for workout sessions
// Manages workout tracking with set management and volume calculations
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AppError } from "../middleware/errorHandler";
import { Exercise } from "../models/Exercise";
import { WorkoutSession } from "../models/WorkoutSession";
import { Set } from "../models/Set";
import { SetCreationAttributes } from "../models/Set";

interface SetData {
  weight: number;
  reps: number;
  notes?: string;
  unit: "kg" | "lb";
}

interface SetWithVolume extends SetData {
  volume: number;
  setNumber: number;
  sessionId: number;
}

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

    // Calculate total volume and ensure all sets have units
    const unit = (req.jwtUser as any)?.preferredUnit || "kg";
    let totalVolume = 0;
    const setsWithVolume = sets.map((set: SetData, index: number) => {
      const volume = set.weight * set.reps;
      totalVolume += volume;
      return {
        ...set,
        unit: set.unit || unit,
        volume,
        setNumber: index + 1,
      };
    });

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
      setsWithVolume.map((setData: SetWithVolume) =>
        Set.create({
          sessionId: workoutSession.id,
          weight: setData.weight,
          reps: setData.reps,
          unit: setData.unit,
          volume: setData.volume,
          setNumber: setData.setNumber,
          notes: setData.notes,
        })
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
          attributes: [
            "weight",
            "reps",
            "notes",
            "unit",
            "volume",
            "setNumber",
          ],
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
          attributes: [
            "weight",
            "reps",
            "notes",
            "unit",
            "volume",
            "setNumber",
          ],
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
          attributes: [
            "weight",
            "reps",
            "notes",
            "unit",
            "volume",
            "setNumber",
          ],
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
      // Delete existing sets
      await Set.destroy({
        where: { sessionId: workoutSession.id },
      });

      // Calculate new total volume
      let totalVolume = 0;
      const setsWithVolume = sets.map((set: SetData, index: number) => {
        const volume = set.weight * set.reps;
        totalVolume += volume;
        return {
          ...set,
          unit: set.unit || workoutSession.unit,
          volume,
          setNumber: index + 1,
          sessionId: workoutSession.id,
        };
      });

      // Create new sets
      await Promise.all(
        setsWithVolume.map((setData: SetWithVolume) =>
          Set.create({
            sessionId: workoutSession.id,
            weight: setData.weight,
            reps: setData.reps,
            unit: setData.unit,
            volume: setData.volume,
            setNumber: setData.setNumber,
            notes: setData.notes,
          })
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
          attributes: [
            "weight",
            "reps",
            "notes",
            "unit",
            "volume",
            "setNumber",
          ],
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
          attributes: [
            "weight",
            "reps",
            "notes",
            "unit",
            "volume",
            "setNumber",
          ],
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
