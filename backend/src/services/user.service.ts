/**
 * User Service
 * 
 * Business logic for user operations
 */

import { PrismaClient } from "../generated/prisma";
import { UpdateUserInput, UpdateProfileInput, ChangePasswordInput } from "../validators/user.validator";
import { hashPassword, verifyPassword } from "../utils/password";

const prisma = new PrismaClient();

export interface UserResult {
  id: string;
  tenantId: string;
  roleId: string | null;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: string;
  lastLoginAt: Date | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

/**
 * Get all users for a tenant
 */
export async function getUsers(
  tenantId: string,
  filters?: {
    status?: string;
    roleId?: string;
    search?: string;
  }
): Promise<UserResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.roleId) {
    where.roleId = filters.roleId;
  }

  if (filters?.search) {
    where.OR = [
      { email: { contains: filters.search, mode: "insensitive" } },
      { username: { contains: filters.search, mode: "insensitive" } },
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Remove password hash from results
  return users.map(({ passwordHash, ...user }) => user) as any;
}

/**
 * Get user by ID
 */
export async function getUserById(
  userId: string,
  tenantId: string
): Promise<UserResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      deletedAt: null,
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Remove password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword as any;
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  tenantId: string,
  input: UpdateUserInput
): Promise<UserResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("User not found or does not belong to this tenant");
  }

  // Check email conflict
  if (input.email && input.email !== existingUser.email) {
    const emailConflict = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: input.email,
        },
      },
    });

    if (emailConflict) {
      throw new Error("Email already exists in this tenant");
    }
  }

  // Check username conflict
  if (input.username && input.username !== existingUser.username) {
    const usernameConflict = await prisma.user.findUnique({
      where: {
        tenantId_username: {
          tenantId,
          username: input.username,
        },
      },
    });

    if (usernameConflict) {
      throw new Error("Username already exists in this tenant");
    }
  }

  // Check role exists and belongs to tenant
  if (input.roleId !== undefined && input.roleId !== null) {
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

  const updateData: any = {};
  if (input.email !== undefined) updateData.email = input.email;
  if (input.username !== undefined) updateData.username = input.username;
  if (input.firstName !== undefined) updateData.firstName = input.firstName;
  if (input.lastName !== undefined) updateData.lastName = input.lastName;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.roleId !== undefined) updateData.roleId = input.roleId;
  if (input.status !== undefined) updateData.status = input.status;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  // Remove password hash
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as any;
}

/**
 * Update user profile (self-update)
 */
export async function updateProfile(
  userId: string,
  tenantId: string,
  input: UpdateProfileInput
): Promise<UserResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new Error("User not found or does not belong to this tenant");
  }

  const updateData: any = {};
  if (input.firstName !== undefined) updateData.firstName = input.firstName;
  if (input.lastName !== undefined) updateData.lastName = input.lastName;
  if (input.phone !== undefined) updateData.phone = input.phone;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  // Remove password hash
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as any;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  tenantId: string,
  input: ChangePasswordInput
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new Error("User not found or does not belong to this tenant");
  }

  // Verify current password
  const isPasswordValid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const newPasswordHash = await hashPassword(input.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(
  userId: string,
  tenantId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new Error("User not found or does not belong to this tenant");
  }

  // Soft delete user
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Also invalidate all user sessions
  await prisma.userSession.deleteMany({
    where: {
      userId,
      tenantId,
    },
  });
}



