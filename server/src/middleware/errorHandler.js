"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // If headers are already sent (e.g., for streaming responses like PDF), just end the response
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Handle Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            status: "fail",
            message: "Validation error",
            errors: err.errors.map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
    }
    // Handle unique constraint errors
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
            status: "fail",
            message: "Duplicate entry",
            errors: err.errors.map((e) => ({
                field: e.path,
                message: `${e.path} already exists`,
            })),
        });
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            status: "fail",
            message: "Invalid token. Please log in again.",
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            status: "fail",
            message: "Your token has expired. Please log in again.",
        });
    }
    // Log unhandled errors in development
    if (process.env.NODE_ENV === "development") {
        console.error("ERROR 💥", err);
    }
    // Generic error response for unhandled errors
    return res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};
exports.errorHandler = errorHandler;
