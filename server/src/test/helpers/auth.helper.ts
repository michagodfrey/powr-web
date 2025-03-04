import jwt from "jsonwebtoken";
import User from "../../models/User";

export const generateTestToken = (user: User): string => {
  const secret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    secret,
    { expiresIn: "1h" }
  );
};

export const createTestUser = async (): Promise<User> => {
  return await User.create({
    googleId: "123456789",
    email: "test@example.com",
    name: "Test User",
  });
};
