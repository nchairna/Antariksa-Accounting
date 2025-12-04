/**
 * User Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Update User Schema
 */
export const updateUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters")
    .optional(),
  phone: z
    .string()
    .max(50, "Phone must be at most 50 characters")
    .optional()
    .nullable(),
  roleId: z
    .string()
    .uuid("Invalid role ID")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "LOCKED"])
    .optional(),
});

/**
 * Update User Profile Schema (for self-update)
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters")
    .optional(),
  phone: z
    .string()
    .max(50, "Phone must be at most 50 characters")
    .optional()
    .nullable(),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * Type exports for TypeScript
 */
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;



