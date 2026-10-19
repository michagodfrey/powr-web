// Validation for the raw text typed into set weight/reps/duration inputs.
// Inputs are kept as strings while editing so fields can be empty mid-edit;
// these helpers decide whether the text is a savable value.
import { ExerciseType } from "../types";

export const MIN_WEIGHT = 1;
export const MIN_REPS = 1;

export interface SetInputErrors {
  weight?: string;
  reps?: string;
  duration?: string;
}

export const validateWeightInput = (value: string): string | undefined => {
  if (value.trim() === "") return "Required";
  const weight = Number(value);
  if (isNaN(weight)) return "Enter a number";
  if (weight < MIN_WEIGHT) return `Min ${MIN_WEIGHT}`;
  return undefined;
};

export const validateRepsInput = (value: string): string | undefined => {
  if (value.trim() === "") return "Required";
  const reps = Number(value);
  if (isNaN(reps) || !Number.isInteger(reps)) return "Whole number";
  if (reps < MIN_REPS) return `Min ${MIN_REPS}`;
  return undefined;
};

// Duration is entered as separate minutes/seconds fields; either may be blank
// (treated as 0) but not both
export const validateDurationInput = (
  minutes: string,
  seconds: string
): string | undefined => {
  if (minutes.trim() === "" && seconds.trim() === "") return "Required";
  const mins = minutes.trim() === "" ? 0 : Number(minutes);
  const secs = seconds.trim() === "" ? 0 : Number(seconds);
  if (
    isNaN(mins) ||
    isNaN(secs) ||
    !Number.isInteger(mins) ||
    !Number.isInteger(secs) ||
    mins < 0 ||
    secs < 0
  ) {
    return "Whole numbers";
  }
  if (secs > 59) return "Seconds 0–59";
  if (mins * 60 + secs < 1) return "Min 0:01";
  return undefined;
};

export const validateSetInputs = (
  set: { weight: string; reps: string; minutes: string; seconds: string },
  exerciseType: ExerciseType = "weighted"
): SetInputErrors => {
  const errors: SetInputErrors = {};
  if (exerciseType === "timed") {
    const durationError = validateDurationInput(set.minutes, set.seconds);
    if (durationError) errors.duration = durationError;
    return errors;
  }
  const repsError = validateRepsInput(set.reps);
  if (repsError) errors.reps = repsError;
  if (exerciseType === "weighted") {
    const weightError = validateWeightInput(set.weight);
    if (weightError) errors.weight = weightError;
  }
  return errors;
};

// Lenient parse for live previews (e.g. running volume): blank/invalid counts as 0
export const parseInputOrZero = (value: string): number => {
  const parsed = Number(value);
  return value.trim() === "" || isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

// Minutes/seconds text to total seconds, leniently (blank/invalid parts count as 0)
export const parseDurationInput = (minutes: string, seconds: string): number =>
  Math.trunc(parseInputOrZero(minutes)) * 60 +
  Math.trunc(parseInputOrZero(seconds));
