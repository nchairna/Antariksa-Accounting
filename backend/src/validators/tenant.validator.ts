/**
 * Tenant Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Update Tenant Schema
 */
export const updateTenantSchema = z.object({
  name: z
    .string()
    .min(1, "Tenant name is required")
    .max(200, "Tenant name must be at most 200 characters")
    .optional(),
  domain: z
    .string()
    .max(100, "Domain must be at most 100 characters")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED", "TRIAL"])
    .optional(),
  subscriptionTier: z
    .enum(["FREE", "STANDARD", "PREMIUM", "ENTERPRISE"])
    .optional(),
});

/**
 * Create Tenant Setting Schema
 */
export const createTenantSettingSchema = z.object({
  key: z
    .string()
    .min(1, "Setting key is required")
    .max(100, "Setting key must be at most 100 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Setting key can only contain letters, numbers, dots, underscores, and hyphens"),
  value: z
    .string()
    .min(1, "Setting value is required"),
});

/**
 * Update Tenant Setting Schema
 */
export const updateTenantSettingSchema = z.object({
  value: z
    .string()
    .min(1, "Setting value is required"),
});

/**
 * Type exports for TypeScript
 */
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateTenantSettingInput = z.infer<typeof createTenantSettingSchema>;
export type UpdateTenantSettingInput = z.infer<typeof updateTenantSettingSchema>;



