/**
 * Role Service
 * 
 * Business logic for role operations
 */

import { PrismaClient } from "../generated/prisma";
import { CreateRoleInput, UpdateRoleInput, AssignPermissionsInput } from "../validators/role.validator";

const prisma = new PrismaClient();

export interface RoleResult {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionResult[];
  _count?: {
    users: number;
  };
}

export interface PermissionResult {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

/**
 * Create a new role
 */
export async function createRole(
  tenantId: string,
  input: CreateRoleInput
): Promise<RoleResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if role name already exists
  const existingRole = await prisma.role.findUnique({
    where: {
      tenantId_name: {
        tenantId,
        name: input.name,
      },
    },
  });

  if (existingRole) {
    throw new Error("Role name already exists in this tenant");
  }

  const role = await prisma.role.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description || null,
      isSystemRole: input.isSystemRole || false,
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return role as any;
}

/**
 * Get all roles for a tenant
 */
export async function getRoles(
  tenantId: string,
  includePermissions: boolean = false
): Promise<RoleResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const roles = await prisma.role.findMany({
    where: {
      tenantId,
    },
    include: {
      permissions: includePermissions ? {
        include: {
          permission: true,
        },
      } : false,
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  if (includePermissions) {
    return roles.map((role: any) => ({
      ...role,
      permissions: role.permissions?.map((rp: any) => rp.permission) || [],
    })) as any;
  }

  return roles as any;
}

/**
 * Get role by ID
 */
export async function getRoleById(
  roleId: string,
  tenantId: string,
  includePermissions: boolean = true
): Promise<RoleResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      tenantId,
    },
    include: {
      permissions: includePermissions ? {
        include: {
          permission: true,
        },
      } : false,
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!role) {
    return null;
  }

  if (includePermissions && (role as any).permissions) {
    return {
      ...role,
      permissions: (role as any).permissions.map((rp: any) => rp.permission),
    } as any;
  }

  return role as any;
}

/**
 * Update role
 */
export async function updateRole(
  roleId: string,
  tenantId: string,
  input: UpdateRoleInput
): Promise<RoleResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingRole = await prisma.role.findFirst({
    where: {
      id: roleId,
      tenantId,
    },
  });

  if (!existingRole) {
    throw new Error("Role not found or does not belong to this tenant");
  }

  // Check name conflict
  if (input.name && input.name !== existingRole.name) {
    const nameConflict = await prisma.role.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: input.name,
        },
      },
    });

    if (nameConflict) {
      throw new Error("Role name already exists in this tenant");
    }
  }

  // Prevent updating system roles
  if (existingRole.isSystemRole && input.name && input.name !== existingRole.name) {
    throw new Error("Cannot rename system roles");
  }

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;

  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: updateData,
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return {
    ...updatedRole,
    permissions: updatedRole.permissions.map((rp: any) => rp.permission),
  } as any;
}

/**
 * Delete role
 */
export async function deleteRole(
  roleId: string,
  tenantId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      tenantId,
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found or does not belong to this tenant");
  }

  // Prevent deleting system roles
  if ((role as any).isSystemRole) {
    throw new Error("Cannot delete system roles");
  }

  // Prevent deleting roles with users
  if ((role as any)._count.users > 0) {
    throw new Error("Cannot delete role that is assigned to users");
  }

  await prisma.role.delete({
    where: { id: roleId },
  });
}

/**
 * Assign permissions to role
 */
export async function assignPermissionsToRole(
  roleId: string,
  tenantId: string,
  input: AssignPermissionsInput
): Promise<RoleResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Verify role exists and belongs to tenant
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      tenantId,
    },
  });

  if (!role) {
    throw new Error("Role not found or does not belong to this tenant");
  }

  // Verify all permissions exist
  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: input.permissionIds,
      },
    },
  });

  if (permissions.length !== input.permissionIds.length) {
    throw new Error("One or more permissions not found");
  }

  // Remove existing permissions
  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
    },
  });

  // Add new permissions
  await prisma.rolePermission.createMany({
    data: input.permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    })),
  });

  // Return updated role with permissions
  return await getRoleById(roleId, tenantId, true) as RoleResult;
}

/**
 * Get all permissions
 */
export async function getPermissions(): Promise<PermissionResult[]> {
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { resource: "asc" },
      { action: "asc" },
    ],
  });

  return permissions as any;
}



