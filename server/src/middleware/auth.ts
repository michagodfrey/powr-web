import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return next(new AppError("Please log in to access this resource", 401));
  }
  next();
};

export const isCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    return next(new AppError("Please log in to access this resource", 401));
  }

  const userId = parseInt(req.params.userId);
  if (req.user && (req.user as any).id !== userId) {
    return next(new AppError("You can only access your own resources", 403));
  }

  next();
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Not authorized" });
};
