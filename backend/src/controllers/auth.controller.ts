/**
 * Authentication Controller
 * 
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser, signupTenantAndUser } from "../services/auth.service";
import { registerSchema, loginSchema, signupSchema } from "../validators/auth.validator";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

/**
 * Signup: Create tenant and first user (public registration)
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    // Validate input
    const validatedInput = signupSchema.parse(req.body);

    // Signup (creates tenant and user)
    const result = await signupTenantAndUser(validatedInput);

    // Return tenant, user, and token
    res.status(201).json({
      message: "Registration successful",
      tenant: result.tenant,
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

    if (error.message === "Company code already exists. Please choose a different one." ||
        error.message === "Domain already exists. Please choose a different one." ||
        error.message === "Email already exists" ||
        error.message === "Username already exists") {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Signup error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to complete registration",
    });
  }
}

/**
 * Register a new user (admin-created)
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Get tenant ID or company code from request
    let tenantId = (req as any).tenantId;
    
    // Fallback: Get tenantId or companyCode from request body
    if (!tenantId) {
      tenantId = (req.body as any)?.tenantId || (req.body as any)?.companyCode;
    }
    
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID or Company Code is required for user registration. Provide via x-tenant-id header, tenantId in body, or companyCode in body.",
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
        error.message === "Role not found or does not belong to this tenant" ||
        error.message === "Company code not found") {
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
    // Get tenant ID from request (can be set earlier in the pipeline)
    let tenantId = (req as any).tenantId;
    
    // Fallback 1: Get tenantId from request body (for login convenience)
    if (!tenantId && (req.body as any)?.tenantId) {
      tenantId = (req.body as any).tenantId;
    }

    // Validate input (email + password)
    const validatedInput = loginSchema.parse(req.body);

    // Fallback 2: Infer tenant from email if tenantId is still missing
    if (!tenantId) {
      const email = validatedInput.email;

      // Find all active users with this email across tenants
      const users = await prisma.user.findMany({
        where: {
          email,
          status: "ACTIVE",
        },
        select: {
          tenantId: true,
        },
      });

      if (users.length === 0) {
        // No user found with this email at all – behave like invalid credentials
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid email or password",
        });
        return;
      }

      if (users.length > 1) {
        // Rare case: same email in multiple tenants – require explicit tenant selection
        res.status(400).json({
          error: "Tenant context required",
          message: "This email is associated with multiple companies. Please contact support to resolve or sign in using a more specific account.",
        });
        return;
      }

      // Exactly one tenant found for this email – infer tenantId
      tenantId = users[0].tenantId;
    }

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

