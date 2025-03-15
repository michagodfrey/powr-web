// client/src/utils/volumeCalculation.ts

export interface VolumeOptions {
  precision?: number; // Number of decimal places
  roundingMethod?: "floor" | "ceil" | "round";
}

const DEFAULT_OPTIONS: VolumeOptions = {
  precision: 2,
  roundingMethod: "round",
};

/**
 * Converts weight between kg and lb
 * @param weight - Weight value to convert
 * @param fromUnit - Source unit ('kg' or 'lb')
 * @param toUnit - Target unit ('kg' or 'lb')
 * @returns Converted weight value
 */
export const convertWeight = (
  weight: number,
  fromUnit: "kg" | "lb",
  toUnit: "kg" | "lb"
): number => {
  if (fromUnit === toUnit) return weight;
  return fromUnit === "kg" ? weight * 2.20462 : weight / 2.20462;
};

/**
 * Validates a single set's data
 * @param set - Set data to validate
 * @throws Error if validation fails
 */
export const validateSet = (set: { weight: number; reps: number }) => {
  if (typeof set.weight !== "number" || set.weight < 0) {
    throw new Error(`Invalid weight value: ${set.weight}`);
  }
  if (
    typeof set.reps !== "number" ||
    set.reps < 0 ||
    !Number.isInteger(set.reps)
  ) {
    throw new Error(`Invalid reps value: ${set.reps}`);
  }
};

/**
 * Calculates volume for a single set
 * @param weight - Weight used in the set
 * @param reps - Number of repetitions
 * @returns Calculated volume
 */
export const calculateSetVolume = (weight: number, reps: number): number => {
  validateSet({ weight, reps });
  return weight * reps;
};

/**
 * Calculates total volume for multiple sets
 * @param sets - Array of sets with weight and reps
 * @param targetUnit - Desired unit for the result
 * @param options - Calculation options
 * @returns Total volume in the specified unit
 */
export const calculateTotalVolume = (
  sets: Array<{ weight: number; reps: number; unit: "kg" | "lb" }>,
  targetUnit: "kg" | "lb",
  options: VolumeOptions = DEFAULT_OPTIONS
): number => {
  const totalVolume = sets.reduce((total, set) => {
    validateSet(set);
    const convertedWeight = convertWeight(set.weight, set.unit, targetUnit);
    return total + calculateSetVolume(convertedWeight, set.reps);
  }, 0);

  const { precision = 2, roundingMethod = "round" } = options;
  const multiplier = Math.pow(10, precision);
  return Math[roundingMethod](totalVolume * multiplier) / multiplier;
};

/**
 * Ensures volume is returned as a number with proper formatting
 * @param volume - Volume value to normalize
 * @param options - Formatting options
 * @returns Normalized volume as a number
 */
export const normalizeVolume = (
  volume: number | string,
  options: VolumeOptions = DEFAULT_OPTIONS
): number => {
  const numericVolume =
    typeof volume === "string" ? parseFloat(volume) : volume;

  if (isNaN(numericVolume) || numericVolume < 0) {
    throw new Error(`Invalid volume value: ${volume}`);
  }

  const { precision = 2, roundingMethod = "round" } = options;
  const multiplier = Math.pow(10, precision);
  return Math[roundingMethod](numericVolume * multiplier) / multiplier;
};
