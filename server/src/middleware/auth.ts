// Authentication middleware for protecting routes and validating JWT tokens
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import jwt from "jsonwebtoken";
import { config } from "../config/validateEnv";
import { User } from "../models/User";

// Extend Request type to include user from JWT
declare global {
  namespace Express {
    interface Request {
      jwtUser?: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

// Extend Express Session type to include our custom properties
declare module "express-session" {
  interface SessionData {
    requestCount?: number;
  }
}

// Extend Cookie type to include rolling property
declare module "express-serve-static-core" {
  interface CookieOptions {
    rolling?: boolean;
  }
}

// JWT validation middleware
export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        id: number;
        email: string;
        name: string;
      };

      console.log("[JWT Middleware] Token valid for user:", decoded.id);

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new AppError("User not found", 401));
      }

      // Attach user to request
      req.jwtUser = decoded;

      console.log("[Auth] JWT validation successful:", {
        userId: decoded.id,
        email: decoded.email,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Token expired", 401));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token", 401));
      }
      throw error;
    }
  } catch (error) {
    console.error("[Auth] JWT validation error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
};

// Middleware to check if user is authenticated
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.jwtUser) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

// Middleware to check if user is accessing their own resources
export const isCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.jwtUser) {
    return next(new AppError("Not authenticated", 401));
  }

  const userId = parseInt(req.params.userId);
  if (req.jwtUser.id !== userId) {
    return next(new AppError("You can only access your own resources", 403));
  }

  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.jwtUser) {
    return next(new AppError("Not authenticated", 401));
  }

  // TODO: Implement admin role check when needed
  return next(new AppError("Admin access not implemented", 501));
};
