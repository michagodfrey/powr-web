// Authentication middleware for protecting routes and validating Supabase-issued JWTs
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import jwt from "jsonwebtoken";
import { config } from "../config/validateEnv";

// Extend Request type to include user from JWT
declare global {
  namespace Express {
    interface Request {
      jwtUser?: {
        id: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

// Validates the Supabase Auth JWT sent as a Bearer token and attaches the
// decoded user (id = Supabase auth.users UUID) to the request.
export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET) as {
        sub: string;
        email: string;
        user_metadata?: { name?: string; full_name?: string; picture?: string; avatar_url?: string };
      };

      req.jwtUser = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.user_metadata?.name || decoded.user_metadata?.full_name,
        picture: decoded.user_metadata?.picture || decoded.user_metadata?.avatar_url,
      };
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
    });
    next(error);
  }
};
