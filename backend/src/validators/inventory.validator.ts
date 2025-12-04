/**
 * Inventory Validator
 * 
 * Validation schemas for item inventory operations
 */

import { z } from "zod";

// Create/Update item inventory input
export const CreateItemInventoryInput = z.object({
  itemId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.coerce.number().nonnegative().default(0),
  reservedQuantity: z.coerce.number().nonnegative().optional().default(0),
  minimumStockLevel: z.coerce.number().nonnegative().optional().nullable(),
  maximumStockLevel: z.coerce.number().nonnegative().optional().nullable(),
  reorderPoint: z.coerce.number().nonnegative().optional().nullable(),
});

export type CreateItemInventoryInput = z.infer<typeof CreateItemInventoryInput>;

// Update item inventory input
export const UpdateItemInventoryInput = z.object({
  quantity: z.coerce.number().nonnegative().optional(),
  reservedQuantity: z.coerce.number().nonnegative().optional(),
  minimumStockLevel: z.coerce.number().nonnegative().optional().nullable(),
  maximumStockLevel: z.coerce.number().nonnegative().optional().nullable(),
  reorderPoint: z.coerce.number().nonnegative().optional().nullable(),
});

export type UpdateItemInventoryInput = z.infer<typeof UpdateItemInventoryInput>;

// Query parameters for listing inventory
export const InventoryQueryParams = z.object({
  itemId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  lowStock: z.coerce.boolean().optional(), // Filter items below minimum stock level
  outOfStock: z.coerce.boolean().optional(), // Filter items with zero quantity
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type InventoryQueryParams = z.infer<typeof InventoryQueryParams>;

// Stock adjustment input
export const StockAdjustmentInput = z.object({
  itemId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.coerce.number(), // Can be positive (increase) or negative (decrease)
  reason: z.string().max(500).optional().nullable(),
  costPerUnit: z.coerce.number().nonnegative().optional().nullable(),
});

export type StockAdjustmentInput = z.infer<typeof StockAdjustmentInput>;

// Stock transfer input
export const StockTransferInput = z.object({
  itemId: z.string().uuid(),
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  reason: z.string().max(500).optional().nullable(),
});

export type StockTransferInput = z.infer<typeof StockTransferInput>;



