import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

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

  // Check session expiration
  if (req.session && req.session.cookie) {
    const now = new Date();
    const expires = new Date(req.session.cookie.expires || 0);

    if (expires <= now) {
      req.session.destroy((err) => {
        if (err) {
          console.error("[Auth] Error destroying expired session:", err);
        }
      });
      console.warn("[Auth] Session expired:", {
        sessionId: req.sessionID,
        expiry: expires,
        now: now,
      });
      return next(new AppError("Session expired. Please log in again", 401));
    }
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
