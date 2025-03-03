import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as User;
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "fallback_secret"
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CORS_ORIGIN}/auth-callback?token=${token}`);
  }
);

// Get current user
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as User;
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
);

// Logout route (optional, since we're using JWTs)
router.post("/logout", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Logged out successfully",
  });
});

export default router;
