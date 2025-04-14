// Authentication middleware for protecting routes and validating user access
// Includes session validation, user permission checks, and admin authorization
import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

// Extend Express Session type to include our custom properties
declare module "express-session" {
  interface SessionData {
    requestCount?: number;
  }
}

// Extend Cookie type to include rolling property
declare module "express-serve-static-core" {
  interface CookieOptions {
    rolling?: boolean;
  }
}

// Protects routes by requiring authentication and validating session
export const protect = (req: Request, res: Response, next: NextFunction) => {
  console.log("[Auth] Checking authentication:", {
    path: req.path,
    method: req.method,
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    timestamp: new Date().toISOString(),
  });

  if (!req.isAuthenticated()) {
    console.warn("[Auth] Unauthorized access attempt:", {
      path: req.path,
      method: req.method,
      sessionID: req.sessionID,
      timestamp: new Date().toISOString(),
    });
    return next(new AppError("Please log in to access this resource", 401));
  }

  // Enhanced session validation
  if (!req.session || !req.user) {
    console.warn("[Auth] Invalid session state:", {
      path: req.path,
      method: req.method,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      hasUser: !!req.user,
      timestamp: new Date().toISOString(),
    });
    return next(new AppError("Invalid session. Please log in again", 401));
  }

  // Check session expiration with buffer time
  if (req.session.cookie) {
    const now = new Date();
    const expires = new Date(req.session.cookie.expires || 0);
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    if (expires.getTime() - now.getTime() <= bufferTime) {
      console.warn("[Auth] Session near expiration:", {
        sessionId: req.sessionID,
        expiry: expires,
        now: now,
        timeLeft: expires.getTime() - now.getTime(),
      });

      // Touch the session to extend its lifetime
      req.session.touch();
      console.log("[Auth] Session extended:", {
        sessionId: req.sessionID,
        newExpiry: req.session.cookie.expires,
      });
    }
  }

  // Rate limiting check (if implemented)
  const requestCount = req.session.requestCount || 0;
  req.session.requestCount = requestCount + 1;

  if (requestCount > 1000) {
    // 1000 requests per session
    console.warn("[Auth] Rate limit exceeded:", {
      sessionId: req.sessionID,
      requestCount,
      path: req.path,
    });
    return next(
      new AppError("Too many requests. Please try again later.", 429)
    );
  }

  console.log("[Auth] Authentication successful:", {
    userId: (req.user as any)?.id,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  next();
};

export const isCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[Auth] Checking user permission:", {
    path: req.path,
    method: req.method,
    requestedUserId: req.params.userId,
    currentUserId: (req.user as any)?.id,
    timestamp: new Date().toISOString(),
  });

  if (!req.isAuthenticated()) {
    console.warn("[Auth] Unauthorized access attempt:", {
      path: req.path,
      method: req.method,
      sessionID: req.sessionID,
      timestamp: new Date().toISOString(),
    });
    return next(new AppError("Please log in to access this resource", 401));
  }

  const userId = parseInt(req.params.userId);
  if (req.user && (req.user as any).id !== userId) {
    console.warn("[Auth] Resource access forbidden:", {
      path: req.path,
      method: req.method,
      requestedUserId: userId,
      currentUserId: (req.user as any).id,
      timestamp: new Date().toISOString(),
    });
    return next(new AppError("You can only access your own resources", 403));
  }

  console.log("[Auth] User permission granted:", {
    userId: (req.user as any)?.id,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  next();
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[Auth] Checking authentication state:", {
    path: req.path,
    method: req.method,
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    timestamp: new Date().toISOString(),
  });

  if (req.isAuthenticated()) {
    console.log("[Auth] User is authenticated:", {
      userId: (req.user as any)?.id,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    return next();
  }

  console.warn("[Auth] Authentication required:", {
    path: req.path,
    method: req.method,
    sessionID: req.sessionID,
    timestamp: new Date().toISOString(),
  });
  res.status(401).json({ error: "Not authenticated" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("[Auth] Checking admin permission:", {
    path: req.path,
    method: req.method,
    userId: (req.user as any)?.id,
    role: (req.user as any)?.role,
    timestamp: new Date().toISOString(),
  });

  if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
    console.log("[Auth] Admin access granted:", {
      userId: (req.user as any)?.id,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    return next();
  }

  console.warn("[Auth] Admin access denied:", {
    path: req.path,
    method: req.method,
    userId: (req.user as any)?.id,
    timestamp: new Date().toISOString(),
  });
  res.status(403).json({ error: "Not authorized" });
};
