import { Router } from "express";
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { getCurrentUser } from "../controllers/authController";

const router = Router();

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
    passport.authenticate("google", (err: any, user: any, info: any) => {
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

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login Error:", err);
          return res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(
              err.message || "Login failed"
            )}`
          );
        }
        // Successful authentication, redirect home
        return res.redirect(process.env.CLIENT_URL as string);
      });
    })(req, res, next);
  }
);

// Check authentication status
router.get("/status", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Get current user
router.get("/me", getCurrentUser);

// Logout route
router.post("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ status: "success" });
  });
});

export default router;
