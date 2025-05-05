// Authentication controller handling user session management
// Provides endpoints for retrieving current user and handling logout
import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/validateEnv";
import { RefreshToken } from "../models/RefreshToken";
import crypto from "crypto";

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

// Helper to generate a secure random refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

// Helper to hash refresh tokens (e.g., SHA-256)
const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.json({ status: "success" }); // Nothing to do
    }
    const hashedToken = hashToken(refreshToken);
    await RefreshToken.destroy({ where: { token: hashedToken } });
    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
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
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );
    const rawRefreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    // Store refresh token in DB
    await RefreshToken.create({
      userId: user.id,
      token: hashedRefreshToken,
      device: req.headers["user-agent"] || undefined,
      expiresAt: refreshTokenExpiry,
    });
    // Return tokens and user info
    res.json({
      accessToken,
      refreshToken: rawRefreshToken,
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
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );
    const rawRefreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    // Store refresh token in DB
    await RefreshToken.create({
      userId: user.id,
      token: hashedRefreshToken,
      device: req.headers["user-agent"] || undefined,
      expiresAt: refreshTokenExpiry,
    });
    // Return tokens and user info
    res.status(201).json({
      accessToken,
      refreshToken: rawRefreshToken,
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
    const hashedToken = hashToken(refreshToken);
    // Find the refresh token in DB
    const tokenEntry = await RefreshToken.findOne({
      where: { token: hashedToken },
    });
    if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }
    // Find the user
    const user = await User.findByPk(tokenEntry.userId);
    if (!user) {
      return next(new AppError("User not found", 401));
    }
    // Rotate: delete old token
    await tokenEntry.destroy();
    // Generate new tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );
    const newRawRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRawRefreshToken);
    const refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await RefreshToken.create({
      userId: user.id,
      token: newHashedRefreshToken,
      device: req.headers["user-agent"] || undefined,
      expiresAt: refreshTokenExpiry,
    });
    res.json({
      accessToken,
      refreshToken: newRawRefreshToken,
    });
  } catch (error) {
    console.error("[Auth] Refresh token error:", error);
    next(error);
  }
};
