"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSendToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const options = {
        expiresIn: "24h", // Use a fixed value for now
    };
    return jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, options);
};
exports.generateToken = generateToken;
const createSendToken = (user, statusCode, res) => {
    const token = (0, exports.generateToken)(user);
    // Remove password from output
    const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user: userWithoutPassword,
        },
    });
};
exports.createSendToken = createSendToken;
