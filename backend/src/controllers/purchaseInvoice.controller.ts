/**
 * Purchase Invoice Controller
 *
 * Handles HTTP requests for purchase invoice endpoints
 */

import { Request, Response } from "express";
import {
  createPurchaseInvoice,
  listPurchaseInvoices,
  getPurchaseInvoiceById,
  updatePurchaseInvoice,
  approvePurchaseInvoice,
  cancelPurchaseInvoice,
  getStatusReport,
} from "../services/purchaseInvoice.service";
import {
  createPurchaseInvoiceSchema,
  purchaseInvoiceListQuerySchema,
  updatePurchaseInvoiceSchema,
  purchaseInvoiceStatusReportQuerySchema,
} from "../validators/purchaseInvoice.validator";

/**
 * Create a new purchase invoice
 * POST /api/purchase-invoices
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId as string | undefined;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedInput = createPurchaseInvoiceSchema.parse(req.body);
    const invoice = await createPurchaseInvoice(tenantId, userId, validatedInput);

    res.status(201).json({
      message: "Purchase invoice created successfully",
      purchaseInvoice: invoice,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    if (
      error.message === "Supplier not found or does not belong to this tenant" ||
      error.message === "Purchase order not found or does not belong to this supplier" ||
      error.message === "Invoice number already exists for this tenant" ||
      error.message ===
        "Shipping address not found or does not belong to this supplier" ||
      error.message ===
        "Billing address not found or does not belong to this supplier" ||
      error.message ===
        "One or more items not found or do not belong to this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create purchase invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create purchase invoice",
    });
  }
}

/**
 * List purchase invoices
 * GET /api/purchase-invoices
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedQuery = purchaseInvoiceListQuerySchema.parse(req.query);
    const result = await listPurchaseInvoices(tenantId, validatedQuery);

    res.status(200).json({
      message: "Purchase invoices retrieved successfully",
      purchaseInvoices: result.purchaseInvoices,
      count: result.count,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: error.errors,
      });
      return;
    }

    console.error("Get purchase invoices error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve purchase invoices",
    });
  }
}

/**
 * Get purchase invoice by ID
 * GET /api/purchase-invoices/:id
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const id = req.params.id;
    const invoice = await getPurchaseInvoiceById(tenantId, id);

    if (!invoice) {
      res.status(404).json({
        error: "Not found",
        message: "Purchase invoice not found",
      });
      return;
    }

    res.status(200).json({
      message: "Purchase invoice retrieved successfully",
      purchaseInvoice: invoice,
    });
  } catch (error: any) {
    console.error("Get purchase invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve purchase invoice",
    });
  }
}

/**
 * Update draft purchase invoice
 * PUT /api/purchase-invoices/:id
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId as string | undefined;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const id = req.params.id;
    const validatedInput = updatePurchaseInvoiceSchema.parse(req.body);

    const invoice = await updatePurchaseInvoice(tenantId, userId, id, validatedInput);

    res.status(200).json({
      message: "Purchase invoice updated successfully",
      purchaseInvoice: invoice,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    if (
      error.message ===
        "Purchase invoice not found or does not belong to this tenant" ||
      error.message === "Only draft purchase invoices can be edited" ||
      error.message === "Supplier not found or does not belong to this tenant" ||
      error.message === "Purchase order not found or does not belong to this supplier" ||
      error.message === "Invoice number already exists for this tenant" ||
      error.message ===
        "Shipping address not found or does not belong to this supplier" ||
      error.message ===
        "Billing address not found or does not belong to this supplier" ||
      error.message ===
        "One or more items not found or do not belong to this tenant"
    ) {
      const status =
        error.message ===
        "Purchase invoice not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update purchase invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update purchase invoice",
    });
  }
}

/**
 * Approve purchase invoice
 * POST /api/purchase-invoices/:id/approve
 */
export async function approve(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId as string | undefined;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const id = req.params.id;
    const invoice = await approvePurchaseInvoice(tenantId, userId, id);

    res.status(200).json({
      message: "Purchase invoice approved successfully",
      purchaseInvoice: invoice,
    });
  } catch (error: any) {
    if (
      error.message ===
        "Purchase invoice not found or does not belong to this tenant" ||
      error.message === "Purchase invoice can only be approved from DRAFT or RECEIVED status"
    ) {
      const status =
        error.message ===
        "Purchase invoice not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Approve purchase invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to approve purchase invoice",
    });
  }
}

/**
 * Cancel purchase invoice
 * POST /api/purchase-invoices/:id/cancel
 */
export async function cancel(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId as string | undefined;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const id = req.params.id;
    const reason = (req.body && (req.body as any).reason) || undefined;

    const invoice = await cancelPurchaseInvoice(tenantId, userId, id, reason);

    res.status(200).json({
      message: "Purchase invoice cancelled successfully",
      purchaseInvoice: invoice,
    });
  } catch (error: any) {
    if (
      error.message ===
        "Purchase invoice not found or does not belong to this tenant" ||
      error.message === "Purchase invoice cannot be cancelled in its current status"
    ) {
      const status =
        error.message ===
        "Purchase invoice not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Cancel purchase invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to cancel purchase invoice",
    });
  }
}

/**
 * Get Purchase Invoice Status Report
 * GET /api/purchase-invoices/reports/status
 */
export async function getStatusReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedQuery = purchaseInvoiceStatusReportQuerySchema.parse(req.query);
    const report = await getStatusReport(
      tenantId,
      validatedQuery.fromDate,
      validatedQuery.toDate
    );

    res.status(200).json({
      message: "Purchase invoice status report retrieved successfully",
      report,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: error.errors,
      });
      return;
    }

    console.error("Get purchase invoice status report error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve purchase invoice status report",
    });
  }
}

