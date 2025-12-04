/**
 * Report Validation Schemas
 *
 * Uses Zod for input validation for all financial reports
 */

import { z } from "zod";

/**
 * Common date range query schema
 */
const dateRangeSchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

/**
 * Sales Summary Report Query Params
 */
export const salesSummaryReportQuerySchema = dateRangeSchema.extend({
  customerId: z.string().uuid().optional(),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"])
    .optional(),
  groupBy: z.enum(["day", "week", "month", "year"]).optional().default("month"),
});

export type SalesSummaryReportQuery = z.infer<typeof salesSummaryReportQuerySchema>;

/**
 * Sales Detail Report Query Params
 */
export const salesDetailReportQuerySchema = dateRangeSchema.extend({
  customerId: z.string().uuid().optional(),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"])
    .optional(),
  invoiceId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type SalesDetailReportQuery = z.infer<typeof salesDetailReportQuerySchema>;

/**
 * Sales by Customer Report Query Params
 */
export const salesByCustomerReportQuerySchema = dateRangeSchema.extend({
  customerId: z.string().uuid().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export type SalesByCustomerReportQuery = z.infer<typeof salesByCustomerReportQuerySchema>;

/**
 * Sales by Item Report Query Params
 */
export const salesByItemReportQuerySchema = dateRangeSchema.extend({
  itemId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  minQuantity: z.coerce.number().optional(),
  maxQuantity: z.coerce.number().optional(),
});

export type SalesByItemReportQuery = z.infer<typeof salesByItemReportQuerySchema>;

/**
 * Sales Trend Analysis Query Params
 */
export const salesTrendAnalysisQuerySchema = dateRangeSchema.extend({
  customerId: z.string().uuid().optional(),
  groupBy: z.enum(["day", "week", "month", "year"]).optional().default("month"),
  metric: z.enum(["amount", "count", "average"]).optional().default("amount"),
});

export type SalesTrendAnalysisQuery = z.infer<typeof salesTrendAnalysisQuerySchema>;

/**
 * Purchase Summary Report Query Params
 */
export const purchaseSummaryReportQuerySchema = dateRangeSchema.extend({
  supplierId: z.string().uuid().optional(),
  status: z
    .enum(["DRAFT", "RECEIVED", "APPROVED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"])
    .optional(),
  groupBy: z.enum(["day", "week", "month", "year"]).optional().default("month"),
});

export type PurchaseSummaryReportQuery = z.infer<typeof purchaseSummaryReportQuerySchema>;

/**
 * Purchase Detail Report Query Params
 */
export const purchaseDetailReportQuerySchema = dateRangeSchema.extend({
  supplierId: z.string().uuid().optional(),
  status: z
    .enum(["DRAFT", "RECEIVED", "APPROVED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"])
    .optional(),
  invoiceId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type PurchaseDetailReportQuery = z.infer<typeof purchaseDetailReportQuerySchema>;

/**
 * Purchase by Supplier Report Query Params
 */
export const purchaseBySupplierReportQuerySchema = dateRangeSchema.extend({
  supplierId: z.string().uuid().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export type PurchaseBySupplierReportQuery = z.infer<typeof purchaseBySupplierReportQuerySchema>;

/**
 * Purchase by Item Report Query Params
 */
export const purchaseByItemReportQuerySchema = dateRangeSchema.extend({
  itemId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  minQuantity: z.coerce.number().optional(),
  maxQuantity: z.coerce.number().optional(),
});

export type PurchaseByItemReportQuery = z.infer<typeof purchaseByItemReportQuerySchema>;

/**
 * Profit & Loss Report Query Params
 */
export const profitLossReportQuerySchema = dateRangeSchema.extend({
  groupBy: z.enum(["day", "week", "month", "year"]).optional().default("month"),
  includeDetails: z.coerce.boolean().optional().default(false),
});

export type ProfitLossReportQuery = z.infer<typeof profitLossReportQuerySchema>;

/**
 * Balance Sheet Report Query Params
 */
export const balanceSheetReportQuerySchema = z.object({
  asOfDate: z.string().datetime().optional(),
  includeDetails: z.coerce.boolean().optional().default(false),
});

export type BalanceSheetReportQuery = z.infer<typeof balanceSheetReportQuerySchema>;

/**
 * Cash Flow Report Query Params
 */
export const cashFlowReportQuerySchema = dateRangeSchema.extend({
  groupBy: z.enum(["day", "week", "month", "year"]).optional().default("month"),
  includeDetails: z.coerce.boolean().optional().default(false),
});

export type CashFlowReportQuery = z.infer<typeof cashFlowReportQuerySchema>;

/**
 * Trial Balance Report Query Params
 */
export const trialBalanceReportQuerySchema = z.object({
  asOfDate: z.string().datetime().optional(),
  includeZeroBalances: z.coerce.boolean().optional().default(false),
});

export type TrialBalanceReportQuery = z.infer<typeof trialBalanceReportQuerySchema>;

/**
 * Tax Summary Report Query Params
 */
export const taxSummaryReportQuerySchema = dateRangeSchema.extend({
  taxRate: z.coerce.number().optional(),
  invoiceType: z.enum(["SALES", "PURCHASE", "BOTH"]).optional().default("BOTH"),
});

export type TaxSummaryReportQuery = z.infer<typeof taxSummaryReportQuerySchema>;

/**
 * Tax Detail Report Query Params
 */
export const taxDetailReportQuerySchema = dateRangeSchema.extend({
  taxRate: z.coerce.number().optional(),
  invoiceType: z.enum(["SALES", "PURCHASE", "BOTH"]).optional().default("BOTH"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type TaxDetailReportQuery = z.infer<typeof taxDetailReportQuerySchema>;

/**
 * Tax by Rate Report Query Params
 */
export const taxByRateReportQuerySchema = dateRangeSchema.extend({
  invoiceType: z.enum(["SALES", "PURCHASE", "BOTH"]).optional().default("BOTH"),
});

export type TaxByRateReportQuery = z.infer<typeof taxByRateReportQuerySchema>;

