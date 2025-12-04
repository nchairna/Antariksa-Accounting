/**
 * Purchase Invoice Validation Schemas
 *
 * Uses Zod for input validation
 */

import { z } from "zod";

const purchaseInvoiceLineSchema = z.object({
  itemId: z.string().uuid("Invalid item ID").optional().nullable(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
  quantityReceived: z.coerce
    .number()
    .positive("Quantity received must be greater than 0"),
  unitCost: z.coerce
    .number()
    .nonnegative("Unit cost must be non-negative"),
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
});

export const createPurchaseInvoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, "Invoice number is required")
    .max(100, "Invoice number must be at most 100 characters"),
  invoiceDate: z
    .string()
    .datetime("invoiceDate must be a valid ISO datetime string"),
  dueDate: z
    .string()
    .datetime("dueDate must be a valid ISO datetime string"),
  supplierId: z.string().uuid("Invalid supplier ID"),
  purchaseOrderId: z.string().uuid("Invalid purchase order ID").optional().nullable(),
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
  referenceNumber: z
    .string()
    .max(100, "Reference number must be at most 100 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .optional()
    .nullable(),
  lines: z
    .array(purchaseInvoiceLineSchema)
    .min(1, "At least one line item is required"),
});

export type CreatePurchaseInvoiceInput = z.infer<typeof createPurchaseInvoiceSchema>;
export type PurchaseInvoiceLineInput = z.infer<typeof purchaseInvoiceLineSchema>;

/**
 * Update Purchase Invoice Schema
 * - Used for editing draft invoices (header + full line set)
 */
export const updatePurchaseInvoiceSchema = createPurchaseInvoiceSchema.partial();

export type UpdatePurchaseInvoiceInput = z.infer<typeof updatePurchaseInvoiceSchema>;

/**
 * Purchase Invoice List Query Params
 */
export const purchaseInvoiceListQuerySchema = z.object({
  status: z
    .enum(["DRAFT", "RECEIVED", "APPROVED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"])
    .optional(),
  supplierId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type PurchaseInvoiceListQuery = z.infer<typeof purchaseInvoiceListQuerySchema>;

/**
 * Purchase Invoice Status Report Query Params
 */
export const purchaseInvoiceStatusReportQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type PurchaseInvoiceStatusReportQuery = z.infer<typeof purchaseInvoiceStatusReportQuerySchema>;

