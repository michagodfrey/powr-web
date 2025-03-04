"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const generateToken = (userId, type = "access") => {
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const expiresIn = type === "access" ? "1h" : "7d";
    return jsonwebtoken_1.default.sign({ id: userId, type }, secret, { expiresIn });
};
// Google OAuth routes
router.get("/google", (req, res, next) => {
    try {
        passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }
    catch (error) {
        const redirectUrl = `${process.env.CORS_ORIGIN}/auth-callback?error=${encodeURIComponent("Failed to initiate Google authentication")}`;
        res.redirect(redirectUrl);
    }
});
router.get("/google/callback", (req, res, next) => {
    passport_1.default.authenticate("google", { session: false }, (err, user) => {
        if (err) {
            console.error("Google authentication error:", err);
            const redirectUrl = `${process.env.CORS_ORIGIN}/auth-callback?error=${encodeURIComponent("Authentication failed. Please try again.")}`;
            return res.redirect(redirectUrl);
        }
        if (!user) {
            const redirectUrl = `${process.env.CORS_ORIGIN}/auth-callback?error=${encodeURIComponent("No user data received from Google")}`;
            return res.redirect(redirectUrl);
        }
        try {
            const accessToken = generateToken(user.id, "access");
            const refreshToken = generateToken(user.id, "refresh");
            // Redirect to frontend with tokens
            res.redirect(`${process.env.CORS_ORIGIN}/auth-callback?token=${accessToken}&refreshToken=${refreshToken}`);
        }
        catch (error) {
            console.error("Token generation error:", error);
            const redirectUrl = `${process.env.CORS_ORIGIN}/auth-callback?error=${encodeURIComponent("Failed to generate authentication token")}`;
            res.redirect(redirectUrl);
        }
    })(req, res, next);
});
// Refresh token endpoint
router.post("/refresh", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new errorHandler_1.AppError("Refresh token is required", 400);
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET || "fallback_secret");
        if (decoded.type !== "refresh") {
            throw new errorHandler_1.AppError("Invalid token type", 400);
        }
        // Generate new access token
        const accessToken = generateToken(decoded.id, "access");
        res.json({
            status: "success",
            data: {
                accessToken,
            },
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AppError("Invalid refresh token", 401));
        }
        else {
            next(error);
        }
    }
}));
// Get current user
router.get("/me", passport_1.default.authenticate("jwt", { session: false }), (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            throw new errorHandler_1.AppError("User not found", 404);
        }
        res.json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Logout endpoint
router.post("/logout", passport_1.default.authenticate("jwt", { session: false }), (req, res) => {
    // In a JWT-based auth system, the client is responsible for removing the token
    // Server-side, we can implement a token blacklist if needed in the future
    res.json({
        status: "success",
        message: "Logged out successfully",
    });
});
exports.default = router;
