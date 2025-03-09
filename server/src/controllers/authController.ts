import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.isAuthenticated()) {
      return next(new AppError("Not authenticated", 401));
    }
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ status: "success" });
  });
};
