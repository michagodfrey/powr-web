import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";

// Define User type for TypeScript
interface UserType {
  id: number;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

// Serialize user for the session
passport.serializeUser((user: Express.User, done) => {
  const userObj = user as UserType;
  done(null, userObj.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return done(new Error("User not found"), undefined);
    }
    done(null, user.toJSON() as UserType);
  } catch (error) {
    done(error, undefined);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
            return done(new Error("No email provided by Google"), undefined);
          }

          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || undefined,
            preferredUnit: "kg", // Default unit as per PRD
          });
        }

        return done(null, user.toJSON() as UserType);
      } catch (error) {
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
