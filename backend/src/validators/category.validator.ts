/**
 * Category Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Create Category Schema
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  parentId: z
    .string()
    .uuid("Invalid parent category ID")
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .optional()
    .nullable(),
});

/**
 * Update Category Schema
 */
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  parentId: z
    .string()
    .uuid("Invalid parent category ID")
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .optional()
    .nullable(),
});

/**
 * Type exports for TypeScript
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;



