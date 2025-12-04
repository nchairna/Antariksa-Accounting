/**
 * Role Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Create Role Schema
 */
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be at most 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Role name can only contain letters, numbers, underscores, and hyphens"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  isSystemRole: z
    .boolean()
    .default(false),
});

/**
 * Update Role Schema
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be at most 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Role name can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
});

/**
 * Assign Permissions to Role Schema
 */
export const assignPermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().uuid("Invalid permission ID"))
    .min(1, "At least one permission is required"),
});

/**
 * Type exports for TypeScript
 */
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;



