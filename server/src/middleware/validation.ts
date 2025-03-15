import { Request, Response, NextFunction } from "express";
import xss from "xss";
import { AppError } from "./errorHandler";

/**
 * Sanitizes a string value by removing XSS and malicious URLs
 */
const sanitizeString = (value: string): string => {
  // First sanitize HTML/XSS
  let sanitized = xss(value);

  // Then handle javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "");
  sanitized = sanitized.replace(/vbscript:/gi, "");

  return sanitized;
};

/**
 * Recursively sanitizes an object's string values
 */
const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Validates exercise data
 */
const validateExercise = (data: any): void => {
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    throw new AppError("Exercise name is required", 400);
  }
};

/**
 * Validates set data
 */
const validateSet = (set: any): void => {
  if (!set || typeof set !== "object") {
    throw new AppError("Invalid set data", 400);
  }

  if (typeof set.weight !== "number" || set.weight < 0) {
    throw new AppError("Weight must be a non-negative number", 400);
  }

  if (typeof set.reps !== "number" || set.reps <= 0) {
    throw new AppError("Reps must be a positive number", 400);
  }

  if (set.unit && !["kg", "lb"].includes(set.unit)) {
    throw new AppError("Unit must be either 'kg' or 'lb'", 400);
  }
};

/**
 * Validates workout data
 */
const validateWorkout = (data: any): void => {
  if (!data.exerciseId || typeof data.exerciseId !== "number") {
    throw new AppError("Valid exercise ID is required", 400);
  }

  if (!data.date || isNaN(Date.parse(data.date))) {
    throw new AppError("Valid date is required", 400);
  }

  if (!Array.isArray(data.sets) || data.sets.length === 0) {
    throw new AppError("At least one set is required", 400);
  }

  data.sets.forEach((set: any, index: number) => {
    try {
      validateSet(set);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AppError(
          `Invalid set at index ${index}: ${error.message}`,
          400
        );
      }
      throw new AppError(`Invalid set at index ${index}`, 400);
    }
  });
};

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Sanitize body if it exists
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters if they exist
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters if they exist
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error: unknown) {
    console.error("[Validation] Input sanitization error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    next(error);
  }
};

/**
 * Middleware to validate exercise data
 */
export const validateExerciseInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateExercise(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Middleware to validate workout data
 */
export const validateWorkoutInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateWorkout(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};
