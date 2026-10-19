// Per-exercise-type set normalization and session totals
// weighted: volume = weight × reps; reps: total reps; timed: total seconds held
import { AppError } from "../middleware/errorHandler";
import { ExerciseType } from "../models/Exercise";

export interface SetInput {
  weight?: number | null;
  reps?: number | null;
  durationSeconds?: number | null;
  unit?: "kg" | "lb";
  notes?: string;
}

export interface NormalizedSet {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  unit: "kg" | "lb";
  volume: number;
  notes?: string;
}

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isPositiveInteger = (value: unknown): value is number =>
  isPositiveNumber(value) && Number.isInteger(value);

/**
 * Keeps only the fields that apply to the exercise type and computes each set's
 * metric plus the session total stored in workout_sessions.total_volume
 * @throws AppError (400) if a set is missing a field its exercise type requires
 */
export const buildSetsForExercise = (
  exerciseType: ExerciseType,
  sets: SetInput[],
  fallbackUnit: "kg" | "lb"
): { sets: NormalizedSet[]; total: number } => {
  const normalized = sets.map((set, index): NormalizedSet => {
    const base = {
      setNumber: index + 1,
      unit: set.unit || fallbackUnit,
      notes: set.notes,
    };
    const invalid = (message: string) =>
      new AppError(`Invalid set at index ${index}: ${message}`, 400);

    switch (exerciseType) {
      case "timed":
        if (!isPositiveInteger(set.durationSeconds)) {
          throw invalid("Duration must be a positive whole number of seconds");
        }
        return {
          ...base,
          weight: null,
          reps: null,
          durationSeconds: set.durationSeconds,
          volume: set.durationSeconds,
        };
      case "reps":
        if (!isPositiveInteger(set.reps)) {
          throw invalid("Reps must be a positive whole number");
        }
        return {
          ...base,
          weight: null,
          reps: set.reps,
          durationSeconds: null,
          volume: set.reps,
        };
      case "weighted":
      default:
        if (!isPositiveNumber(set.weight)) {
          throw invalid("Weight must be a positive number");
        }
        if (!isPositiveInteger(set.reps)) {
          throw invalid("Reps must be a positive whole number");
        }
        return {
          ...base,
          weight: set.weight,
          reps: set.reps,
          durationSeconds: null,
          volume: set.weight * set.reps,
        };
    }
  });

  const total = normalized.reduce((sum, set) => sum + set.volume, 0);
  return { sets: normalized, total };
};
