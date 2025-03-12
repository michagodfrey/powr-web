import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getCurrentUser Debug:", {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      user: req.user,
      session: req.session,
      cookies: req.cookies,
    });

    if (!req.isAuthenticated()) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!req.user) {
      console.error("User is authenticated but req.user is missing");
      return next(new AppError("User data not found", 500));
    }

    res.json(req.user);
  } catch (error) {
    console.error("getCurrentUser Error:", error);
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ status: "success" });
  });
};
