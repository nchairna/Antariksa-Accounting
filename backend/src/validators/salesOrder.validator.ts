/**
 * Sales Order Validation Schemas
 *
 * Uses Zod for input validation
 */

import { z } from "zod";

const salesOrderLineSchema = z.object({
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

export const createSalesOrderSchema = z.object({
  soDate: z
    .string()
    .datetime("soDate must be a valid ISO datetime string"),
  expectedDeliveryDate: z
    .string()
    .datetime("expectedDeliveryDate must be a valid ISO datetime string")
    .optional()
    .nullable(),
  customerId: z.string().uuid("Invalid customer ID"),
  customerReference: z
    .string()
    .max(100, "Customer reference must be at most 100 characters")
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
    .array(salesOrderLineSchema)
    .min(1, "At least one line item is required"),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
export type SalesOrderLineInput = z.infer<typeof salesOrderLineSchema>;

/**
 * Update Sales Order Schema
 * - Used for editing draft SOs (header + full line set)
 */
export const updateSalesOrderSchema = createSalesOrderSchema.partial();

export type UpdateSalesOrderInput = z.infer<typeof updateSalesOrderSchema>;

/**
 * Sales Order List Query Params
 */
export const salesOrderListQuerySchema = z.object({
  status: z
    .enum(["DRAFT", "CONFIRMED", "PARTIALLY_DELIVERED", "COMPLETED", "CANCELLED"])
    .optional(),
  customerId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type SalesOrderListQuery = z.infer<typeof salesOrderListQuerySchema>;

/**
 * SO Status Report Query Params
 */
export const soStatusReportQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type SOStatusReportQuery = z.infer<typeof soStatusReportQuerySchema>;

/**
 * SO vs Delivery Report Query Params
 */
export const soVsDeliveryReportQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  customerId: z.string().uuid().optional(),
});

export type SOVsDeliveryReportQuery = z.infer<typeof soVsDeliveryReportQuerySchema>;

/**
 * Delivery Note (DN) Creation Schema
 */
export const createDeliveryNoteSchema = z.object({
  deliveryDate: z
    .string()
    .datetime("deliveryDate must be a valid ISO datetime string"),
  deliveryLines: z
    .array(
      z.object({
        salesOrderLineId: z.string().uuid("Invalid sales order line ID"),
        quantityDelivered: z.coerce
          .number()
          .positive("Quantity delivered must be greater than 0"),
        locationId: z.string().uuid("Invalid location ID").optional().nullable(),
      })
    )
    .min(1, "At least one delivery line is required"),
});

export type CreateDeliveryNoteInput = z.infer<typeof createDeliveryNoteSchema>;

