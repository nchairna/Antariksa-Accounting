/**
 * Location Validator
 * 
 * Validation schemas for inventory location operations
 */

import { z } from "zod";

// Location status enum
export const LocationStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

// Create location input
export const CreateLocationInput = z.object({
  code: z.string().min(1).max(50).transform(val => val.toUpperCase().trim()),
  name: z.string().min(1).max(255),
  address: z.string().max(500).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
  status: LocationStatusEnum.optional().default("ACTIVE"),
});

export type CreateLocationInput = z.infer<typeof CreateLocationInput>;

// Update location input
export const UpdateLocationInput = z.object({
  code: z.string().min(1).max(50).transform(val => val.toUpperCase().trim()).optional(),
  name: z.string().min(1).max(255).optional(),
  address: z.string().max(500).optional().nullable(),
  isDefault: z.boolean().optional(),
  status: LocationStatusEnum.optional(),
});

export type UpdateLocationInput = z.infer<typeof UpdateLocationInput>;

// Query parameters for listing locations
export const LocationQueryParams = z.object({
  status: LocationStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type LocationQueryParams = z.infer<typeof LocationQueryParams>;



