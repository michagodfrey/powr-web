// Authentication routes handling Google OAuth flow and session management
// Includes login, logout, callback handling, and user status endpoints
import { Router } from "express";
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { getCurrentUser } from "../controllers/authController";

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

// Google OAuth routes
router.get(
  "/google",
  (req: Request, res: Response, next: NextFunction) => {
    // Store the intended destination in the session
    if (req.query.redirect) {
      req.session.returnTo = req.query.redirect as string;
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      (err: any, user: Express.User | false, info: any) => {
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

          // Get the stored return URL from session
          const returnTo = req.session.returnTo || "/";
          delete req.session.returnTo;

          // Log successful authentication
          console.log(
            `User ${user.id} (${user.email}) successfully authenticated`
          );

          // Ensure session is saved before redirecting
          req.session.save(() => {
            res.redirect(`${process.env.CLIENT_URL}${returnTo}`);
          });
        });
      }
    )(req, res, next);
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
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.user.id;
  const userEmail = req.user.email;

  req.logout((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Session destruction failed" });
      }

      // Log successful logout
      console.log(`User ${userId} (${userEmail}) logged out successfully`);

      res.json({ status: "success" });
    });
  });
});

export default router;
