/**
 * Authentication Service
 * 
 * Business logic for authentication operations
 */

import { PrismaClient } from "../generated/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken, JWTPayload } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { UserStatus } from "../generated/prisma";

const prisma = new PrismaClient();

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    roleId: string | null;
    tenantId: string;
  };
  token: string;
  sessionId: string;
}

/**
 * Register a new user (admin-created)
 * @param tenantId - Tenant ID (from tenant context)
 * @param input - User registration data
 * @returns User and token
 */
export async function registerUser(
  tenantId: string,
  input: RegisterInput
): Promise<AuthResult> {
  // Set tenant context for RLS (ensure it's set for this connection)
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);
  
  // Check if email already exists in this tenant
  const existingUser = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId,
        email: input.email,
      },
    },
  });

  if (existingUser) {
    throw new Error("Email already exists in this tenant");
  }

  // Check if username already exists in this tenant
  const existingUsername = await prisma.user.findUnique({
    where: {
      tenantId_username: {
        tenantId,
        username: input.username,
      },
    },
  });

  if (existingUsername) {
    throw new Error("Username already exists in this tenant");
  }

  // Verify role exists and belongs to tenant (if provided)
  if (input.roleId) {
    const role = await prisma.role.findFirst({
      where: {
        id: input.roleId,
        tenantId,
      },
    });

    if (!role) {
      throw new Error("Role not found or does not belong to this tenant");
    }
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      tenantId,
      email: input.email,
      username: input.username,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      roleId: input.roleId || null,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      roleId: true,
      tenantId: true,
    },
  });

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    username: user.username,
    roleId: user.roleId || undefined,
  };

  const token = generateToken(tokenPayload);

  // Create user session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      tenantId: user.tenantId,
      token,
      expiresAt,
    },
  });

  return {
    user,
    token,
    sessionId: session.id,
  };
}

/**
 * Login user
 * @param tenantId - Tenant ID (from tenant context)
 * @param input - Login credentials
 * @param ipAddress - Client IP address (optional)
 * @param userAgent - Client user agent (optional)
 * @returns User and token
 */
export async function loginUser(
  tenantId: string,
  input: LoginInput,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  // Set tenant context for RLS (ensure it's set for this connection)
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);
  
  // Find user by email in this tenant
  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: input.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Error finding user in login:", error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("User account is not active");
  }

  // Verify password
  const isValidPassword = await verifyPassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    username: user.username,
    roleId: user.roleId || undefined,
  };

  const token = generateToken(tokenPayload);

  // Delete existing sessions for this user (single session per user)
  // This prevents unique constraint errors and ensures only one active session
  await prisma.userSession.deleteMany({
    where: {
      userId: user.id,
      tenantId: user.tenantId,
    },
  });

  // Create new user session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      tenantId: user.tenantId,
      token,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      tenantId: user.tenantId,
    },
    token,
    sessionId: session.id,
  };
}

/**
 * Logout user (invalidate session)
 * @param token - JWT token to invalidate
 */
export async function logoutUser(token: string): Promise<void> {
  // Delete session by token
  await prisma.userSession.deleteMany({
    where: {
      token,
    },
  });
}

/**
 * Get user by ID (for authenticated requests)
 * @param userId - User ID
 * @param tenantId - Tenant ID (for security)
 * @returns User or null
 */
export async function getUserById(
  userId: string,
  tenantId: string
): Promise<{
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roleId: string | null;
  tenantId: string;
} | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      roleId: true,
      tenantId: true,
    },
  });

  return user;
}

