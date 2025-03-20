// Global error handling middleware for consistent error responses
// Handles Sequelize errors, validation errors, and custom application errors
import { Request, Response, NextFunction } from "express";

// Custom error class for application-specific errors
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleSequelizeValidationError = (err: any) => {
  const message = Object.values(err.errors)
    .map((item: any) => item.message)
    .join(". ");
  return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err: any) => {
  const message = `Duplicate field value: ${err.errors[0].value}. Please use another value.`;
  return new AppError(message, 400);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error information
  console.error("Error Details:", {
    path: req.path,
    method: req.method,
    errorName: err.name,
    errorMessage: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    isAuthenticated: req.isAuthenticated?.(),
    sessionID: req.sessionID,
    user: req.user,
  });

  // If error already has statusCode, use it, otherwise default to 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;

  // Handle Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    error = handleSequelizeValidationError(err);
  }

  // Handle Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    error = handleSequelizeUniqueConstraintError(err);
  }

  // Handle AppError (our custom validation errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (process.env.NODE_ENV === "development") {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Operational, trusted error: send message to client
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
};
