import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User";
import { config } from "./validateEnv";
import { AppError } from "../middleware/errorHandler";

// Extend Express.User interface
declare global {
  namespace Express {
    interface User {
      id: number;
      googleId: string;
      email: string;
      name: string;
      picture?: string;
      preferredUnit: "kg" | "lb";
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

// Serialize user for the session
passport.serializeUser((user: Express.User, done) => {
  try {
    done(null, user.id);
  } catch (error) {
    console.error("Error serializing user:", error);
    done(new AppError("Authentication failed", 500), null);
  }
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      console.error(`User not found for id: ${id}`);
      return done(new AppError("User not found", 401), undefined);
    }
    done(null, user.toJSON() as Express.User);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(new AppError("Session validation failed", 500), undefined);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (!user) {
          // Create new user if doesn't exist
          const email = profile.emails?.[0]?.value;
          if (!email) {
            console.error(
              "No email provided by Google for profile:",
              profile.id
            );
            return done(
              new AppError("No email provided by Google", 400),
              undefined
            );
          }

          try {
            user = await User.create({
              googleId: profile.id,
              email: email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value || undefined,
              preferredUnit: "kg", // Default unit as per PRD
            });

            console.log(`Created new user: ${user.id} (${email})`);
          } catch (createError) {
            console.error("Error creating user:", createError);
            return done(
              new AppError("Failed to create user account", 500),
              undefined
            );
          }
        }

        // Ensure we have a complete user object with all required fields
        const userJson = user.toJSON() as Express.User;
        if (!userJson.createdAt || !userJson.updatedAt) {
          console.error("Invalid user object:", userJson);
          return done(new AppError("Invalid user data", 500), undefined);
        }

        return done(null, userJson);
      } catch (error) {
        console.error("Error in Google OAuth strategy:", error);
        return done(new AppError("Authentication failed", 500), undefined);
      }
    }
  )
);

export default passport;
