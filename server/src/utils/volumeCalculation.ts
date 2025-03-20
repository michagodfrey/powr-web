// Server-side utilities for workout volume calculations and validation
// Ensures data consistency and handles unit conversions for workout metrics
import { Set } from "../models/Set";

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
export const validateSet = (set: {
  weight: number | string;
  reps: number | string;
}) => {
  // Convert weight to number and validate
  const weightNum =
    typeof set.weight === "string" ? parseFloat(set.weight) : set.weight;
  if (typeof weightNum !== "number" || isNaN(weightNum) || weightNum < 0) {
    throw new Error(`Invalid weight value: ${set.weight}`);
  }

  // Convert reps to number and validate
  const repsNum =
    typeof set.reps === "string" ? parseInt(set.reps, 10) : set.reps;
  if (
    typeof repsNum !== "number" ||
    isNaN(repsNum) ||
    repsNum < 0 ||
    !Number.isInteger(repsNum)
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
export const calculateSetVolume = (
  weight: number | string,
  reps: number | string
): number => {
  const weightNum = typeof weight === "string" ? parseFloat(weight) : weight;
  const repsNum = typeof reps === "string" ? parseInt(reps, 10) : reps;
  validateSet({ weight: weightNum, reps: repsNum });
  return weightNum * repsNum;
};

/**
 * Calculates total volume for multiple sets
 * @param sets - Array of sets with weight and reps
 * @param targetUnit - Desired unit for the result
 * @param options - Calculation options
 * @returns Total volume in the specified unit
 */
export const calculateTotalVolume = (
  sets: Array<{
    weight: number | string;
    reps: number | string;
    unit: "kg" | "lb";
  }>,
  targetUnit: "kg" | "lb",
  options: VolumeOptions = DEFAULT_OPTIONS
): number => {
  const totalVolume = sets.reduce((total, set) => {
    const weightNum =
      typeof set.weight === "string" ? parseFloat(set.weight) : set.weight;
    const repsNum =
      typeof set.reps === "string" ? parseInt(set.reps, 10) : set.reps;
    validateSet({ weight: weightNum, reps: repsNum });
    const convertedWeight = convertWeight(weightNum, set.unit, targetUnit);
    return total + calculateSetVolume(convertedWeight, repsNum);
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
