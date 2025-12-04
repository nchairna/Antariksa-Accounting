/**
 * Role Controller
 * 
 * Handles HTTP requests for role endpoints
 */

import { Request, Response } from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  getPermissions,
} from "../services/role.service";
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
} from "../validators/role.validator";

/**
 * Create a new role
 * POST /api/roles
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedInput = createRoleSchema.parse(req.body);
    const role = await createRole(tenantId, validatedInput);

    res.status(201).json({
      message: "Role created successfully",
      role,
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

    if (error.message === "Role name already exists in this tenant") {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create role error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create role",
    });
  }
}

/**
 * Get all roles
 * GET /api/roles
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const includePermissions = req.query.permissions === "true";
    const roles = await getRoles(tenantId, includePermissions);

    res.status(200).json({
      message: "Roles retrieved successfully",
      roles,
      count: roles.length,
    });
  } catch (error: any) {
    console.error("Get roles error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve roles",
    });
  }
}

/**
 * Get role by ID
 * GET /api/roles/:id
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const roleId = req.params.id;
    const role = await getRoleById(roleId, tenantId, true);

    if (!role) {
      res.status(404).json({
        error: "Not found",
        message: "Role not found",
      });
      return;
    }

    res.status(200).json({
      message: "Role retrieved successfully",
      role,
    });
  } catch (error: any) {
    console.error("Get role error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve role",
    });
  }
}

/**
 * Update role
 * PUT /api/roles/:id
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const roleId = req.params.id;
    const validatedInput = updateRoleSchema.parse(req.body);

    const role = await updateRole(roleId, tenantId, validatedInput);

    res.status(200).json({
      message: "Role updated successfully",
      role,
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

    if (
      error.message === "Role not found or does not belong to this tenant" ||
      error.message === "Role name already exists in this tenant" ||
      error.message === "Cannot rename system roles"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update role error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update role",
    });
  }
}

/**
 * Delete role
 * DELETE /api/roles/:id
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const roleId = req.params.id;
    await deleteRole(roleId, tenantId);

    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error: any) {
    if (
      error.message === "Role not found or does not belong to this tenant" ||
      error.message === "Cannot delete system roles" ||
      error.message === "Cannot delete role that is assigned to users"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Delete role error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete role",
    });
  }
}

/**
 * Assign permissions to role
 * POST /api/roles/:id/permissions
 */
export async function assignPermissions(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const roleId = req.params.id;
    const validatedInput = assignPermissionsSchema.parse(req.body);

    const role = await assignPermissionsToRole(roleId, tenantId, validatedInput);

    res.status(200).json({
      message: "Permissions assigned successfully",
      role,
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

    if (
      error.message === "Role not found or does not belong to this tenant" ||
      error.message === "One or more permissions not found"
    ) {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Assign permissions error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to assign permissions",
    });
  }
}

/**
 * Get all permissions
 * GET /api/permissions
 */
export async function getAllPermissions(req: Request, res: Response): Promise<void> {
  try {
    const permissions = await getPermissions();

    res.status(200).json({
      message: "Permissions retrieved successfully",
      permissions,
      count: permissions.length,
    });
  } catch (error: any) {
    console.error("Get permissions error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve permissions",
    });
  }
}



