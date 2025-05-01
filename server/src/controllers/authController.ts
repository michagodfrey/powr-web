// Authentication controller handling user session management
// Provides endpoints for retrieving current user and handling logout
import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/validateEnv";

interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

// Generate access and refresh tokens
const generateTokens = (user: TokenPayload) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.JWT_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Get the currently authenticated user's information
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.jwtUser) {
      return next(new AppError("Not authenticated", 401));
    }

    const user = await User.findByPk(req.jwtUser.id);
    if (!user) {
      return next(new AppError("User not found", 401));
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      preferredUnit: user.preferredUnit,
      picture: user.picture,
    });
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

// Login controller for email/password
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Return tokens and user info
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferredUnit: user.preferredUnit,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    next(error);
  }
};

// Registration controller for email/password
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = await User.create({
      email,
      name,
      passwordHash,
      preferredUnit: "kg", // default
    });

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Return tokens and user info
    res.status(201).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferredUnit: user.preferredUnit,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token controller
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        config.JWT_REFRESH_SECRET
      ) as TokenPayload;

      // Generate new tokens
      const tokens = generateTokens({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      });

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Refresh token expired", 401));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid refresh token", 401));
      }
      throw error;
    }
  } catch (error) {
    console.error("[Auth] Refresh token error:", error);
    next(error);
  }
};
