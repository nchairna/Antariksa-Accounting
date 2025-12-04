/**
 * Tenant Context Middleware
 * 
 * This middleware sets the tenant context for Row-Level Security (RLS).
 * It extracts the tenant ID from the request and sets it in PostgreSQL session.
 * 
 * Priority:
 * 1. JWT token (from authenticated user)
 * 2. x-tenant-id header (for development/testing)
 * 3. subdomain (future implementation)
 */

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../generated/prisma";
import { extractTokenFromHeader, verifyToken } from "../utils/jwt";

// Initialize Prisma client
// Note: In production, use a singleton pattern to reuse connections
const prisma = new PrismaClient();

/**
 * Extract tenant ID from request
 * Priority:
 * 1. JWT token (from authenticated user or Authorization header)
 * 2. x-tenant-id header - for development/testing
 * 3. subdomain - future implementation
 */
function extractTenantId(req: Request): string | null {
  // Priority 1: Extract from authenticated user (set by auth middleware)
  if (req.user?.tenantId) {
    return req.user.tenantId;
  }

  // Priority 1b: Extract from JWT token in Authorization header (if not authenticated yet)
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  if (token) {
    const payload = verifyToken(token);
    if (payload?.tenantId) {
      return payload.tenantId;
    }
  }

  // Priority 2: Development - Extract from header
  const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
  if (headerTenantId) {
    return headerTenantId;
  }

  // Priority 3: Future - Extract from subdomain
  // const subdomain = req.hostname.split('.')[0];
  // if (subdomain && subdomain !== 'www') {
  //   return subdomain;
  // }

  return null;
}

/**
 * Tenant Context Middleware
 * 
 * Sets app.current_tenant_id in PostgreSQL session for RLS filtering.
 * This must be called before any database queries.
 */
export async function tenantContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = extractTenantId(req);

    if (!tenantId) {
      // For health check and public endpoints, allow without tenant
      if (req.path === "/health" || req.path === "/api/health") {
        return next();
      }

      // For auth endpoints (signup/register/login), let the controllers handle tenant context themselves.
      // - Signup creates a new tenant, so no tenant context is needed here.
      // - Register/login can resolve tenant from body (tenantId or companyCode) and set context in services.
      if (
        req.path.startsWith("/api/auth/signup") ||
        req.path.startsWith("/api/auth/register") ||
        req.path.startsWith("/api/auth/login")
      ) {
        return next();
      }

      // Otherwise, require tenant ID
      res.status(400).json({
        error: "Tenant context required",
        message: "Missing tenant ID. Provide x-tenant-id header, authenticate with JWT token, or include tenantId in request body.",
      });
      return;
    }

    // Set tenant ID in PostgreSQL session for RLS
    // This makes all subsequent queries automatically filtered by tenant
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

    // Attach tenant ID to request for use in route handlers
    (req as any).tenantId = tenantId;

    next();
  } catch (error) {
    console.error("Error setting tenant context:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to set tenant context",
    });
  }
}

/**
 * Optional: Clear tenant context after request
 * Useful for connection pooling scenarios
 */
export async function clearTenantContext(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`RESET app.current_tenant_id`);
  } catch (error) {
    console.error("Error clearing tenant context:", error);
  }
}

