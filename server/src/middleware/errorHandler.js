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
const handleSequelizeValidationError = (err) => {
    const message = Object.values(err.errors)
        .map((item) => item.message)
        .join(". ");
    return new AppError(message, 400);
};
const handleSequelizeUniqueConstraintError = (err) => {
    const message = `Duplicate field value: ${err.errors[0].value}. Please use another value.`;
    return new AppError(message, 400);
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    let error = Object.assign({}, err);
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
    }
    else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        else {
            // Programming or other unknown error: don't leak error details
            console.error("ERROR 💥", err);
            res.status(500).json({
                status: "error",
                message: "Something went wrong!",
            });
        }
    }
};
exports.errorHandler = errorHandler;
