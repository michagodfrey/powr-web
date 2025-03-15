import { Request, Response, NextFunction } from "express";
import xss from "xss";

/**
 * Sanitizes a string value by removing XSS and malicious URLs
 */
const sanitizeString = (value: string): string => {
  // First sanitize HTML/XSS
  let sanitized = xss(value);

  // Then handle javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "");
  sanitized = sanitized.replace(/vbscript:/gi, "");

  return sanitized;
};

/**
 * Recursively sanitizes an object's string values
 */
const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Sanitize body if it exists
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters if they exist
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters if they exist
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error("[Validation] Input sanitization error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    next(error);
  }
};
