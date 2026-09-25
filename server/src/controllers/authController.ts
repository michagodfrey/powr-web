// Authentication controller — Supabase Auth handles login/signup/tokens directly;
// this just serves (and lazily creates) the app-specific profile row for the
// authenticated Supabase user.
import { Request, Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.jwtUser) {
      return next(new AppError("Not authenticated", 401));
    }

    let user = await User.findByPk(req.jwtUser.id);
    if (!user) {
      // First authenticated request for this Supabase user — create their profile row.
      // The client can fire several /me requests concurrently right after sign-in,
      // so if another request won the insert, fall back to reading its row.
      try {
        user = await User.create({
          id: req.jwtUser.id,
          email: req.jwtUser.email,
          name: req.jwtUser.name || req.jwtUser.email.split("@")[0],
          picture: req.jwtUser.picture,
          preferredUnit: "kg",
        });
      } catch (createError) {
        if (!(createError instanceof UniqueConstraintError)) throw createError;
        user = await User.findByPk(req.jwtUser.id);
        if (!user) throw createError;
      }
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
