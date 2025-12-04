/**
 * Sales Invoice Validation Schemas
 *
 * Uses Zod for input validation
 */

import { z } from "zod";

const salesInvoiceLineSchema = z.object({
  itemId: z.string().uuid("Invalid item ID").optional().nullable(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0"),
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
});

export const createSalesInvoiceSchema = z.object({
  invoiceDate: z
    .string()
    .datetime("invoiceDate must be a valid ISO datetime string"),
  dueDate: z
    .string()
    .datetime("dueDate must be a valid ISO datetime string"),
  customerId: z.string().uuid("Invalid customer ID"),
  salesOrderId: z.string().uuid("Invalid sales order ID").optional().nullable(),
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
  termsConditions: z
    .string()
    .max(2000, "Terms and conditions must be at most 2000 characters")
    .optional()
    .nullable(),
  lines: z
    .array(salesInvoiceLineSchema)
    .min(1, "At least one line item is required"),
});

export type CreateSalesInvoiceInput = z.infer<typeof createSalesInvoiceSchema>;
export type SalesInvoiceLineInput = z.infer<typeof salesInvoiceLineSchema>;

/**
 * Update Sales Invoice Schema
 * - Used for editing draft invoices (header + full line set)
 */
export const updateSalesInvoiceSchema = createSalesInvoiceSchema.partial();

export type UpdateSalesInvoiceInput = z.infer<typeof updateSalesInvoiceSchema>;

/**
 * Sales Invoice List Query Params
 */
export const salesInvoiceListQuerySchema = z.object({
  status: z
    .enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"])
    .optional(),
  customerId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type SalesInvoiceListQuery = z.infer<typeof salesInvoiceListQuerySchema>;

/**
 * Sales Invoice Status Report Query Params
 */
export const salesInvoiceStatusReportQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type SalesInvoiceStatusReportQuery = z.infer<typeof salesInvoiceStatusReportQuerySchema>;

