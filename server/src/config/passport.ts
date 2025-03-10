import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User";

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID environment variable is required");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET environment variable is required");
}

if (!process.env.SERVER_URL) {
  throw new Error("SERVER_URL environment variable is required");
}

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
    done(error, null);
  }
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      console.error(`User not found for id: ${id}`);
      return done(new Error("User not found"), undefined);
    }
    done(null, user.toJSON() as Express.User);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, undefined);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
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
            return done(new Error("No email provided by Google"), undefined);
          }

          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || undefined,
            preferredUnit: "kg", // Default unit as per PRD
          });

          console.log(`Created new user: ${user.id} (${email})`);
        }

        return done(null, user.toJSON() as Express.User);
      } catch (error) {
        console.error("Error in Google OAuth strategy:", error);
        if (error instanceof Error) {
          return done(error, undefined);
        }
        return done(
          new Error("Unknown error during authentication"),
          undefined
        );
      }
    }
  )
);

export default passport;
