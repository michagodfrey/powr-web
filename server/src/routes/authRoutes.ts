import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { AppError } from "../middleware/errorHandler";

const router = express.Router();

const generateToken = (
  userId: number,
  type: "access" | "refresh" = "access"
) => {
  const secret = process.env.JWT_SECRET || "fallback_secret";
  const expiresIn = type === "access" ? "1h" : "7d";

  return jwt.sign({ id: userId, type }, secret, { expiresIn });
};

// Google OAuth routes
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  } catch (error) {
    const redirectUrl = `${
      process.env.CORS_ORIGIN
    }/auth-callback?error=${encodeURIComponent(
      "Failed to initiate Google authentication"
    )}`;
    res.redirect(redirectUrl);
  }
});

router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      { session: false },
      (err: Error, user: User) => {
        if (err) {
          console.error("Google authentication error:", err);
          const redirectUrl = `${
            process.env.CORS_ORIGIN
          }/auth-callback?error=${encodeURIComponent(
            "Authentication failed. Please try again."
          )}`;
          return res.redirect(redirectUrl);
        }

        if (!user) {
          const redirectUrl = `${
            process.env.CORS_ORIGIN
          }/auth-callback?error=${encodeURIComponent(
            "No user data received from Google"
          )}`;
          return res.redirect(redirectUrl);
        }

        try {
          const accessToken = generateToken(user.id, "access");
          const refreshToken = generateToken(user.id, "refresh");

          // Redirect to frontend with tokens
          res.redirect(
            `${process.env.CORS_ORIGIN}/auth-callback?token=${accessToken}&refreshToken=${refreshToken}`
          );
        } catch (error) {
          console.error("Token generation error:", error);
          const redirectUrl = `${
            process.env.CORS_ORIGIN
          }/auth-callback?error=${encodeURIComponent(
            "Failed to generate authentication token"
          )}`;
          res.redirect(redirectUrl);
        }
      }
    )(req, res, next);
  }
);

// Refresh token endpoint
router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET || "fallback_secret"
      ) as {
        id: number;
        type: string;
      };

      if (decoded.type !== "refresh") {
        throw new AppError("Invalid token type", 400);
      }

      // Generate new access token
      const accessToken = generateToken(decoded.id, "access");

      res.json({
        status: "success",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new AppError("Invalid refresh token", 401));
      } else {
        next(error);
      }
    }
  }
);

// Get current user
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;

      if (!user) {
        throw new AppError("User not found", 404);
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
    } catch (error) {
      next(error);
    }
  }
);

// Logout endpoint
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req: Request, res: Response) => {
    // In a JWT-based auth system, the client is responsible for removing the token
    // Server-side, we can implement a token blacklist if needed in the future
    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  }
);

export default router;
