"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthenticated = exports.isCurrentUser = exports.protect = void 0;
const errorHandler_1 = require("./errorHandler");
const protect = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next(new errorHandler_1.AppError("Please log in to access this resource", 401));
    }
    next();
};
exports.protect = protect;
const isCurrentUser = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next(new errorHandler_1.AppError("Please log in to access this resource", 401));
    }
    const userId = parseInt(req.params.userId);
    if (req.user && req.user.id !== userId) {
        return next(new errorHandler_1.AppError("You can only access your own resources", 403));
    }
    next();
};
exports.isCurrentUser = isCurrentUser;
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Not authenticated" });
};
exports.isAuthenticated = isAuthenticated;
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user && req.user.role === "admin") {
        return next();
    }
    res.status(403).json({ error: "Not authorized" });
};
exports.isAdmin = isAdmin;
