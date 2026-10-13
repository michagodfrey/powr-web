// Validation for the raw text typed into set weight/reps inputs.
// Inputs are kept as strings while editing so fields can be empty mid-edit;
// these helpers decide whether the text is a savable value.

export const MIN_WEIGHT = 1;
export const MIN_REPS = 1;

export interface SetInputErrors {
  weight?: string;
  reps?: string;
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

export const validateSetInputs = (set: {
  weight: string;
  reps: string;
}): SetInputErrors => {
  const errors: SetInputErrors = {};
  const weightError = validateWeightInput(set.weight);
  const repsError = validateRepsInput(set.reps);
  if (weightError) errors.weight = weightError;
  if (repsError) errors.reps = repsError;
  return errors;
};

// Lenient parse for live previews (e.g. running volume): blank/invalid counts as 0
export const parseInputOrZero = (value: string): number => {
  const parsed = Number(value);
  return value.trim() === "" || isNaN(parsed) || parsed < 0 ? 0 : parsed;
};
