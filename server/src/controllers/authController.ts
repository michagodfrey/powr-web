import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as User;

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
