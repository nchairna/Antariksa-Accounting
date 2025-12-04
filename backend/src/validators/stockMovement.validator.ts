/**
 * Stock Movement Validator
 * 
 * Validation schemas for stock movement operations
 */

import { z } from "zod";

// Stock movement type enum
export const StockMovementTypeEnum = z.enum([
  "INBOUND",
  "OUTBOUND",
  "ADJUSTMENT",
  "TRANSFER",
  "DAMAGE",
]);

// Query parameters for listing stock movements
export const StockMovementQueryParams = z.object({
  itemId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  movementType: StockMovementTypeEnum.optional(),
  referenceType: z.string().optional(), // invoice, purchase_order, sales_order, etc.
  referenceId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type StockMovementQueryParams = z.infer<typeof StockMovementQueryParams>;



