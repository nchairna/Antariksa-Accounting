/**
 * Goods Receipt (GRN) Validation Schemas
 */

import { z } from "zod";

export const goodsReceiptLineSchema = z.object({
  purchaseOrderLineId: z.string().uuid("Invalid purchase order line ID"),
  quantityReceived: z.coerce
    .number()
    .positive("Quantity received must be greater than 0"),
  locationId: z.string().uuid("Invalid location ID").optional(),
});

export const createGoodsReceiptSchema = z.object({
  grnDate: z
    .string()
    .datetime("grnDate must be a valid ISO datetime string")
    .optional(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .optional()
    .nullable(),
  lines: z
    .array(goodsReceiptLineSchema)
    .min(1, "At least one receipt line is required"),
});

export type CreateGoodsReceiptInput = z.infer<typeof createGoodsReceiptSchema>;
export type GoodsReceiptLineInput = z.infer<typeof goodsReceiptLineSchema>;




