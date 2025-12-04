/**
 * Authentication Controller
 * 
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";

/**
 * Register a new user (admin-created)
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Get tenant ID from request (set by tenant context middleware or from body)
    let tenantId = (req as any).tenantId;
    
    // Fallback: Get tenantId from request body (for admin registration)
    if (!tenantId && (req.body as any)?.tenantId) {
      tenantId = (req.body as any).tenantId;
    }
    
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required for user registration. Provide via x-tenant-id header or in request body.",
      });
      return;
    }

    // Validate input
    const validatedInput = registerSchema.parse(req.body);

    // Register user
    const result = await registerUser(tenantId, validatedInput);

    // Return user (without password) and token
    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    if (error.message === "Email already exists in this tenant" ||
        error.message === "Username already exists in this tenant" ||
        error.message === "Role not found or does not belong to this tenant") {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to register user",
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Get tenant ID from request (set by tenant context middleware or from body)
    let tenantId = (req as any).tenantId;
    
    // Fallback: Get tenantId from request body (for login convenience)
    if (!tenantId && (req.body as any)?.tenantId) {
      tenantId = (req.body as any).tenantId;
    }
    
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required for login. Provide via x-tenant-id header or in request body.",
      });
      return;
    }

    // Validate input
    const validatedInput = loginSchema.parse(req.body);

    // Get client info
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.headers["user-agent"] || undefined;

    // Login user
    const result = await loginUser(tenantId, validatedInput, ipAddress, userAgent);

    // Return user and token
    res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    if (error.message === "Invalid email or password" ||
        error.message === "User account is not active") {
      res.status(401).json({
        error: "Unauthorized",
        message: error.message,
      });
      return;
    }

    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to login",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // Get token from request (set by auth middleware)
    const token = (req as any).token;
    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
      return;
    }

    // Logout user (invalidate session)
    await logoutUser(token);

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to logout",
    });
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    // Get user from request (set by auth middleware)
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        tenantId: user.tenantId,
      },
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get current user",
    });
  }
}

