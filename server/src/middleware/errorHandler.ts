import { Request, Response, NextFunction } from "express";

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

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;

  // Sequelize validation error
  if (err.name === "SequelizeValidationError")
    error = handleSequelizeValidationError(err);

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError")
    error = handleSequelizeUniqueConstraintError(err);

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
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
