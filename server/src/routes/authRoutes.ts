// Authentication routes handling Google OAuth flow and JWT management
// Includes login, logout, callback handling, and user status endpoints
import { Router } from "express";
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import {
  getCurrentUser,
  register,
  login,
  refreshToken,
} from "../controllers/authController";
import { validateJWT } from "../middleware/auth";
import jwt from "jsonwebtoken";
import { config } from "../config/validateEnv";
import { User } from "../models/User";

// Extend Express types to include our custom session properties
declare module "express-session" {
  interface SessionData {
    returnTo?: string;
  }
}

// Validate required environment variables
if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL environment variable is required");
}

const router = Router();

// Email/password routes
router.post("/login", login);
router.post("/register", register);

// Token management
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", validateJWT, getCurrentUser);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      (err: any, user: User | false, info: any) => {
        if (err) {
          console.error("Google OAuth Error:", err);
          return res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(
              err.message || "Authentication failed"
            )}`
          );
        }

        if (!user) {
          console.error("Authentication failed:", info);
          return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
        }

        // Generate tokens
        const tokens = {
          accessToken: jwt.sign(
            {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
          ),
          refreshToken: jwt.sign(
            {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
          ),
        };

        // Redirect with tokens
        res.redirect(
          `${process.env.CLIENT_URL}/auth/callback?` +
            `accessToken=${tokens.accessToken}&` +
            `refreshToken=${tokens.refreshToken}`
        );
      }
    )(req, res, next);
  }
);

// Check authentication status
router.get("/status", validateJWT, (req: Request, res: Response) => {
  res.json({ isAuthenticated: true, user: req.jwtUser });
});

// Logout route (client-side only - just clear the token)
router.post("/logout", (req: Request, res: Response) => {
  res.json({ status: "success" });
});

export default router;
