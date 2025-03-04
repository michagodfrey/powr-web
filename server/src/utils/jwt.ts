import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import User from "../models/User";

export const generateToken = (user: User): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: "24h", // Use a fixed value for now
  };

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, options);
};

export const createSendToken = (user: User, statusCode: number, res: any) => {
  const token = generateToken(user);

  // Remove password from output
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userWithoutPassword,
    },
  });
};
