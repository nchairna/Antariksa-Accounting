/**
 * Payment Controller
 *
 * Express handlers for payment endpoints
 */

import { Request, Response } from "express";
import {
  createPayment,
  listPayments,
  getPaymentById,
  updatePayment,
  cancelPayment,
  approvePayment,
  getAROutstandingInvoices,
  getARAgingAnalysis,
  getAPOutstandingInvoices,
  getAPAgingAnalysis,
} from "../services/payment.service";
import {
  createPaymentSchema,
  updatePaymentSchema,
  paymentListQuerySchema,
  arOutstandingInvoicesQuerySchema,
  arAgingAnalysisQuerySchema,
  apOutstandingInvoicesQuerySchema,
  apAgingAnalysisQuerySchema,
} from "../validators/payment.validator";

/**
 * Create a new payment
 * POST /api/payments
 */
export async function create(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;

    const validated = createPaymentSchema.parse(req.body);

    const payment = await createPayment(tenantId, userId, validated);

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create payment",
    });
  }
}

/**
 * List payments with filters
 * GET /api/payments
 */
export async function getAll(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = paymentListQuerySchema.parse(req.query);

    const result = await listPayments(tenantId, query);

    res.json({
      success: true,
      data: result.payments,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error listing payments:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to list payments",
    });
  }
}

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
export async function getById(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    const payment = await getPaymentById(tenantId, id);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    const status = error.message === "Payment not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message || "Failed to fetch payment",
    });
  }
}

/**
 * Update payment
 * PUT /api/payments/:id
 */
export async function update(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    const validated = updatePaymentSchema.parse(req.body);

    const payment = await updatePayment(tenantId, id, validated);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Error updating payment:", error);
    const status = error.message === "Payment not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message || "Failed to update payment",
    });
  }
}

/**
 * Cancel payment
 * POST /api/payments/:id/cancel
 */
export async function cancel(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await cancelPayment(tenantId, id, reason);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Error cancelling payment:", error);
    const status = error.message === "Payment not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message || "Failed to cancel payment",
    });
  }
}

/**
 * Approve payment
 * POST /api/payments/:id/approve
 */
export async function approve(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;
    const { id } = req.params;

    const payment = await approvePayment(tenantId, id, userId);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Error approving payment:", error);
    const status = error.message === "Payment not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message || "Failed to approve payment",
    });
  }
}

/**
 * Get AR Outstanding Invoices
 * GET /api/payments/ar/outstanding
 */
export async function getAROutstandingHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = arOutstandingInvoicesQuerySchema.parse(req.query);

    const invoices = await getAROutstandingInvoices(tenantId, query);

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    console.error("Error fetching AR outstanding invoices:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch AR outstanding invoices",
    });
  }
}

/**
 * Get AR Aging Analysis
 * GET /api/payments/ar/aging
 */
export async function getARAgingHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = arAgingAnalysisQuerySchema.parse(req.query);

    const analysis = await getARAgingAnalysis(tenantId, query);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("Error fetching AR aging analysis:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch AR aging analysis",
    });
  }
}

/**
 * Get AP Outstanding Invoices
 * GET /api/payments/ap/outstanding
 */
export async function getAPOutstandingHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = apOutstandingInvoicesQuerySchema.parse(req.query);

    const invoices = await getAPOutstandingInvoices(tenantId, query);

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    console.error("Error fetching AP outstanding invoices:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch AP outstanding invoices",
    });
  }
}

/**
 * Get AP Aging Analysis
 * GET /api/payments/ap/aging
 */
export async function getAPAgingHandler(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = apAgingAnalysisQuerySchema.parse(req.query);

    const analysis = await getAPAgingAnalysis(tenantId, query);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("Error fetching AP aging analysis:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch AP aging analysis",
    });
  }
}

