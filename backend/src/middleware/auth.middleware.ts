/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user information to request
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import { getUserById } from "../services/auth.service";

/**
 * Extend Express Request to include user and token
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        roleId: string | null;
        tenantId: string;
      };
      token?: string;
    }
  }
}

/**
 * Authentication Middleware
 * 
 * Verifies JWT token and attaches user to request
 * Also attaches token for logout functionality
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "No token provided. Please include 'Authorization: Bearer <token>' header.",
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
      return;
    }

    // Get tenant ID from request (set by tenant context middleware)
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    // Verify tenant ID matches token
    if (payload.tenantId !== tenantId) {
      res.status(403).json({
        error: "Forbidden",
        message: "Token tenant does not match request tenant",
      });
      return;
    }

    // Get user from database (to ensure user still exists and is active)
    const user = await getUserById(payload.userId, tenantId);
    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not found or inactive",
      });
      return;
    }

    // Attach user and token to request
    req.user = user;
    (req as any).token = token;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Authentication failed",
    });
  }
}



