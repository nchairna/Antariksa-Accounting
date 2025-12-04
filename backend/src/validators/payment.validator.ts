/**
 * Payment Validation Schemas
 *
 * Uses Zod for input validation
 */

import { z } from "zod";

const paymentAllocationSchema = z.object({
  invoiceType: z.enum(["SALES_INVOICE", "PURCHASE_INVOICE"]),
  invoiceId: z.string().uuid("Invalid invoice ID"),
  amountAllocated: z.coerce
    .number()
    .positive("Amount allocated must be greater than 0"),
});

export const createPaymentSchema = z.object({
  paymentDate: z
    .string()
    .datetime("paymentDate must be a valid ISO datetime string"),
  paymentType: z.enum(["CUSTOMER_PAYMENT", "SUPPLIER_PAYMENT"]),
  customerId: z
    .string()
    .uuid("Invalid customer ID")
    .optional()
    .nullable(),
  supplierId: z
    .string()
    .uuid("Invalid supplier ID")
    .optional()
    .nullable(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CREDIT_CARD", "OTHER"]),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0"),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .default("USD"),
  referenceNumber: z
    .string()
    .max(100, "Reference number must be at most 100 characters")
    .optional()
    .nullable(),
  bankAccount: z
    .string()
    .max(100, "Bank account must be at most 100 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .optional()
    .nullable(),
  allocations: z
    .array(paymentAllocationSchema)
    .min(1, "At least one payment allocation is required"),
}).refine(
  (data) => {
    if (data.paymentType === "CUSTOMER_PAYMENT") {
      return !!data.customerId && !data.supplierId;
    } else {
      return !!data.supplierId && !data.customerId;
    }
  },
  {
    message: "Customer ID required for customer payments, Supplier ID required for supplier payments",
  }
).refine(
  (data) => {
    const totalAllocated = data.allocations.reduce(
      (sum, alloc) => sum + Number(alloc.amountAllocated),
      0
    );
    return totalAllocated <= Number(data.amount);
  },
  {
    message: "Total allocated amount cannot exceed payment amount",
  }
);

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentAllocationInput = z.infer<typeof paymentAllocationSchema>;

/**
 * Update Payment Schema
 * - Used for editing pending payments
 */
export const updatePaymentSchema = createPaymentSchema.partial();

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

/**
 * Payment List Query Params
 */
export const paymentListQuerySchema = z.object({
  paymentType: z
    .enum(["CUSTOMER_PAYMENT", "SUPPLIER_PAYMENT"])
    .optional(),
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  status: z
    .enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"])
    .optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;

/**
 * AR Outstanding Invoices Query Params
 */
export const arOutstandingInvoicesQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  overdueOnly: z.coerce.boolean().optional().default(false),
});

export type AROutstandingInvoicesQuery = z.infer<typeof arOutstandingInvoicesQuerySchema>;

/**
 * AR Aging Analysis Query Params
 */
export const arAgingAnalysisQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  asOfDate: z.string().datetime().optional(),
});

export type ARAgingAnalysisQuery = z.infer<typeof arAgingAnalysisQuerySchema>;

/**
 * AP Outstanding Invoices Query Params
 */
export const apOutstandingInvoicesQuerySchema = z.object({
  supplierId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  overdueOnly: z.coerce.boolean().optional().default(false),
});

export type APOutstandingInvoicesQuery = z.infer<typeof apOutstandingInvoicesQuerySchema>;

/**
 * AP Aging Analysis Query Params
 */
export const apAgingAnalysisQuerySchema = z.object({
  supplierId: z.string().uuid().optional(),
  asOfDate: z.string().datetime().optional(),
});

export type APAgingAnalysisQuery = z.infer<typeof apAgingAnalysisQuerySchema>;

