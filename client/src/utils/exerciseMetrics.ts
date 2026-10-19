// Per-exercise-type metrics: what a session's headline number is, how to label it,
// and how to format it. Weighted volume math stays in volumeCalculation.ts.
import { ExerciseType, WorkoutSession } from "../types";
import { convertWeight, normalizeVolume } from "./volumeCalculation";

export const EXERCISE_TYPE_OPTIONS: Array<{
  value: ExerciseType;
  label: string;
  description: string;
}> = [
  {
    value: "weighted",
    label: "Weighted",
    description: "Weight × reps, e.g. Bench Press",
  },
  {
    value: "reps",
    label: "Reps",
    description: "Total reps, e.g. Push-ups",
  },
  {
    value: "timed",
    label: "Timed",
    description: "Time held, e.g. Plank",
  },
];

export const getExerciseType = (exercise: {
  exerciseType?: ExerciseType;
}): ExerciseType => exercise.exerciseType ?? "weighted";

/**
 * Formats seconds as m:ss (or h:mm:ss for an hour or more)
 */
export const formatDuration = (totalSeconds: number): string => {
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

export const sumReps = (sets: Array<{ reps?: number | null }>): number =>
  sets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0);

export const sumDuration = (
  sets: Array<{ durationSeconds?: number | null }>
): number =>
  sets.reduce((sum, set) => sum + (Number(set.durationSeconds) || 0), 0);

export const longestHold = (
  sets: Array<{ durationSeconds?: number | null }>
): number =>
  sets.reduce((max, set) => Math.max(max, Number(set.durationSeconds) || 0), 0);

export const maxRepsInSet = (sets: Array<{ reps?: number | null }>): number =>
  sets.reduce((max, set) => Math.max(max, Number(set.reps) || 0), 0);

/**
 * Average reps per set — the sets-to-reps ratio for reps exercises
 */
export const repsPerSet = (sets: Array<{ reps?: number | null }>): number =>
  sets.length === 0 ? 0 : sumReps(sets) / sets.length;

/**
 * A session's headline value for charts and stats: volume in the display
 * unit (weighted), total reps (reps), or total seconds (timed)
 */
export const getSessionValue = (
  workout: WorkoutSession,
  exerciseType: ExerciseType,
  unit: "kg" | "lb"
): number => {
  switch (exerciseType) {
    case "reps":
      return sumReps(workout.sets);
    case "timed":
      return sumDuration(workout.sets);
    case "weighted":
    default: {
      const volume = normalizeVolume(workout.totalVolume);
      return workout.unit === unit
        ? volume
        : convertWeight(volume, workout.unit, unit);
    }
  }
};

/**
 * Name of the headline metric, e.g. "Volume", "Reps", "Time"
 */
export const getMetricName = (exerciseType: ExerciseType): string =>
  exerciseType === "reps" ? "Reps" : exerciseType === "timed" ? "Time" : "Volume";

/**
 * Formats a headline value for display, e.g. "1,250.0 kg", "85 reps", "2:30"
 */
export const formatMetric = (
  value: number,
  exerciseType: ExerciseType,
  unit: "kg" | "lb",
  decimals = 1
): string => {
  switch (exerciseType) {
    case "reps":
      return `${Math.round(value)} ${Math.round(value) === 1 ? "rep" : "reps"}`;
    case "timed":
      return formatDuration(value);
    case "weighted":
    default:
      return `${value.toFixed(decimals)} ${unit}`;
  }
};
