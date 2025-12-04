/**
 * Item Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Create Item Schema
 */
export const createItemSchema = z.object({
  code: z
    .string()
    .min(1, "Item code is required")
    .max(50, "Item code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Item code can only contain uppercase letters, numbers, underscores, and hyphens"),
  name: z
    .string()
    .min(1, "Item name is required")
    .max(200, "Item name must be at most 200 characters"),
  shortDescription: z
    .string()
    .max(500, "Short description must be at most 500 characters")
    .optional()
    .nullable(),
  longDescription: z
    .string()
    .max(5000, "Long description must be at most 5000 characters")
    .optional()
    .nullable(),
  categoryId: z
    .string()
    .uuid("Invalid category ID")
    .optional()
    .nullable(),
  brand: z
    .string()
    .max(100, "Brand must be at most 100 characters")
    .optional()
    .nullable(),
  modelNumber: z
    .string()
    .max(100, "Model number must be at most 100 characters")
    .optional()
    .nullable(),
  barcode: z
    .string()
    .max(100, "Barcode must be at most 100 characters")
    .optional()
    .nullable(),
  unitOfMeasurement: z
    .string()
    .min(1, "Unit of measurement is required")
    .max(20, "Unit of measurement must be at most 20 characters")
    .default("PCS"),
  purchasePrice: z
    .number()
    .nonnegative("Purchase price must be non-negative")
    .finite("Purchase price must be a valid number"),
  sellingPrice: z
    .number()
    .nonnegative("Selling price must be non-negative")
    .finite("Selling price must be a valid number"),
  wholesalePrice: z
    .number()
    .nonnegative("Wholesale price must be non-negative")
    .finite("Wholesale price must be a valid number")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .default("USD"),
  taxCategoryId: z
    .string()
    .uuid("Invalid tax category ID")
    .optional()
    .nullable(),
  taxRate: z
    .number()
    .min(0, "Tax rate must be non-negative")
    .max(1, "Tax rate must be between 0 and 1 (e.g., 0.1 for 10%)")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "OUT_OF_STOCK"])
    .default("ACTIVE"),
});

/**
 * Update Item Schema
 */
export const updateItemSchema = z.object({
  code: z
    .string()
    .min(1, "Item code is required")
    .max(50, "Item code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Item code can only contain uppercase letters, numbers, underscores, and hyphens")
    .optional(),
  name: z
    .string()
    .min(1, "Item name is required")
    .max(200, "Item name must be at most 200 characters")
    .optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must be at most 500 characters")
    .optional()
    .nullable(),
  longDescription: z
    .string()
    .max(5000, "Long description must be at most 5000 characters")
    .optional()
    .nullable(),
  categoryId: z
    .string()
    .uuid("Invalid category ID")
    .optional()
    .nullable(),
  brand: z
    .string()
    .max(100, "Brand must be at most 100 characters")
    .optional()
    .nullable(),
  modelNumber: z
    .string()
    .max(100, "Model number must be at most 100 characters")
    .optional()
    .nullable(),
  barcode: z
    .string()
    .max(100, "Barcode must be at most 100 characters")
    .optional()
    .nullable(),
  unitOfMeasurement: z
    .string()
    .min(1, "Unit of measurement is required")
    .max(20, "Unit of measurement must be at most 20 characters")
    .optional(),
  purchasePrice: z
    .number()
    .nonnegative("Purchase price must be non-negative")
    .finite("Purchase price must be a valid number")
    .optional(),
  sellingPrice: z
    .number()
    .nonnegative("Selling price must be non-negative")
    .finite("Selling price must be a valid number")
    .optional(),
  wholesalePrice: z
    .number()
    .nonnegative("Wholesale price must be non-negative")
    .finite("Wholesale price must be a valid number")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .optional(),
  taxCategoryId: z
    .string()
    .uuid("Invalid tax category ID")
    .optional()
    .nullable(),
  taxRate: z
    .number()
    .min(0, "Tax rate must be non-negative")
    .max(1, "Tax rate must be between 0 and 1 (e.g., 0.1 for 10%)")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "OUT_OF_STOCK"])
    .optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;



