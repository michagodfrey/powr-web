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

// Configure Passport
export const configurePassport = () => {
  // Serialize user for the session
  passport.serializeUser((user: Express.User, done) => {
    try {
      console.log("[Auth] Serializing user:", {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
      done(null, user.id);
    } catch (error) {
      console.error("[Auth] Serialization error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });
      done(new AppError("Authentication failed", 500), null);
    }
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("[Auth] Deserializing user:", {
        userId: id,
        timestamp: new Date().toISOString(),
      });

      const user = await User.findByPk(id);
      if (!user) {
        console.error("[Auth] User not found during deserialization:", {
          userId: id,
          timestamp: new Date().toISOString(),
        });
        return done(new AppError("User not found", 401), undefined);
      }

      console.log("[Auth] User deserialized successfully:", {
        userId: id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      done(null, user.toJSON() as Express.User);
    } catch (error) {
      console.error("[Auth] Deserialization error:", {
        userId: id,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });
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
          console.log("[Auth] Google OAuth callback received:", {
            profileId: profile.id,
            email: profile.emails?.[0]?.value,
            timestamp: new Date().toISOString(),
          });

          // Check if user exists
          let user = await User.findOne({
            where: { googleId: profile.id },
          });

          if (!user) {
            console.log("[Auth] Creating new user:", {
              profileId: profile.id,
              email: profile.emails?.[0]?.value,
              timestamp: new Date().toISOString(),
            });

            const email = profile.emails?.[0]?.value;
            if (!email) {
              console.error("[Auth] No email provided by Google:", {
                profileId: profile.id,
                timestamp: new Date().toISOString(),
              });
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
                preferredUnit: "kg",
              });

              console.log("[Auth] User created successfully:", {
                userId: user.id,
                email: email,
                timestamp: new Date().toISOString(),
              });
            } catch (createError) {
              console.error("[Auth] User creation error:", {
                error:
                  createError instanceof Error
                    ? createError.message
                    : "Unknown error",
                email: email,
                timestamp: new Date().toISOString(),
                stack:
                  createError instanceof Error ? createError.stack : undefined,
              });
              return done(
                new AppError("Failed to create user account", 500),
                undefined
              );
            }
          } else {
            console.log("[Auth] Existing user found:", {
              userId: user.id,
              email: user.email,
              timestamp: new Date().toISOString(),
            });
          }

          // Ensure we have a complete user object
          const userJson = user.toJSON() as Express.User;
          if (!userJson.createdAt || !userJson.updatedAt) {
            console.error("[Auth] Invalid user object:", {
              userId: user.id,
              timestamp: new Date().toISOString(),
              userJson,
            });
            return done(new AppError("Invalid user data", 500), undefined);
          }

          console.log("[Auth] Authentication successful:", {
            userId: user.id,
            email: user.email,
            timestamp: new Date().toISOString(),
          });

          return done(null, userJson);
        } catch (error) {
          console.error("[Auth] Google OAuth strategy error:", {
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
            stack: error instanceof Error ? error.stack : undefined,
          });
          return done(new AppError("Authentication failed", 500), undefined);
        }
      }
    )
  );

  return passport;
};

export default passport;
