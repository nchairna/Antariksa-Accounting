/**
 * Purchase Order Validation Schemas
 *
 * Uses Zod for input validation
 */

import { z } from "zod";

const purchaseOrderLineSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .nullable(),
  quantityOrdered: z.coerce
    .number()
    .positive("Quantity ordered must be greater than 0"),
  unitPrice: z.coerce
    .number()
    .nonnegative("Unit price must be non-negative"),
  discountPercentage: z.coerce
    .number()
    .min(0, "Discount percentage must be non-negative")
    .max(1, "Discount percentage must be between 0 and 1 (e.g., 0.1 for 10%)")
    .optional()
    .nullable()
    .default(0),
  taxRate: z.coerce
    .number()
    .min(0, "Tax rate must be non-negative")
    .max(1, "Tax rate must be between 0 and 1 (e.g., 0.1 for 10%)")
    .optional()
    .nullable()
    .default(0),
  expectedDeliveryDate: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});

export const createPurchaseOrderSchema = z.object({
  poDate: z
    .string()
    .datetime("poDate must be a valid ISO datetime string"),
  expectedDeliveryDate: z
    .string()
    .datetime("expectedDeliveryDate must be a valid ISO datetime string")
    .optional()
    .nullable(),
  supplierId: z.string().uuid("Invalid supplier ID"),
  supplierReference: z
    .string()
    .max(100, "Supplier reference must be at most 100 characters")
    .optional()
    .nullable(),
  shippingAddressId: z.string().uuid("Invalid shipping address ID").optional().nullable(),
  billingAddressId: z.string().uuid("Invalid billing address ID").optional().nullable(),
  paymentTerms: z
    .string()
    .max(100, "Payment terms must be at most 100 characters")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .default("USD"),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .optional()
    .nullable(),
  lines: z
    .array(purchaseOrderLineSchema)
    .min(1, "At least one line item is required"),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type PurchaseOrderLineInput = z.infer<typeof purchaseOrderLineSchema>;

/**
 * Update Purchase Order Schema
 * - Used for editing draft POs (header + full line set)
 */
export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial();

export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;

/**
 * Purchase Order List Query Params
 */
export const purchaseOrderListQuerySchema = z.object({
  status: z
    .enum(["DRAFT", "SENT", "CONFIRMED", "PARTIALLY_RECEIVED", "COMPLETED", "CANCELLED"])
    .optional(),
  supplierId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type PurchaseOrderListQuery = z.infer<typeof purchaseOrderListQuerySchema>;

/**
 * PO Status Report Query Params
 */
export const poStatusReportQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type POStatusReportQuery = z.infer<typeof poStatusReportQuerySchema>;

/**
 * PO vs Receipt Report Query Params
 */
export const poVsReceiptReportQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  supplierId: z.string().uuid().optional(),
});

export type POVsReceiptReportQuery = z.infer<typeof poVsReceiptReportQuerySchema>;


