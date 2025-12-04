/**
 * Sales Invoice Controller
 *
 * Handles HTTP requests for sales invoice endpoints
 */

import { Request, Response } from "express";
import {
  createSalesInvoice,
  listSalesInvoices,
  getSalesInvoiceById,
  updateSalesInvoice,
  cancelSalesInvoice,
  getStatusReport,
} from "../services/salesInvoice.service";
import {
  createSalesInvoiceSchema,
  salesInvoiceListQuerySchema,
  updateSalesInvoiceSchema,
  salesInvoiceStatusReportQuerySchema,
} from "../validators/salesInvoice.validator";

/**
 * Create a new sales invoice
 * POST /api/sales-invoices
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

    const validatedInput = createSalesInvoiceSchema.parse(req.body);
    const invoice = await createSalesInvoice(tenantId, userId, validatedInput);

    res.status(201).json({
      message: "Sales invoice created successfully",
      salesInvoice: invoice,
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
      error.message === "Customer not found or does not belong to this tenant" ||
      error.message === "Sales order not found or does not belong to this customer" ||
      error.message ===
        "Shipping address not found or does not belong to this customer" ||
      error.message ===
        "Billing address not found or does not belong to this customer" ||
      error.message ===
        "One or more items not found or do not belong to this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create sales invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create sales invoice",
    });
  }
}

/**
 * List sales invoices
 * GET /api/sales-invoices
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

    const validatedQuery = salesInvoiceListQuerySchema.parse(req.query);
    const result = await listSalesInvoices(tenantId, validatedQuery);

    res.status(200).json({
      message: "Sales invoices retrieved successfully",
      salesInvoices: result.salesInvoices,
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

    console.error("Get sales invoices error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve sales invoices",
    });
  }
}

/**
 * Get sales invoice by ID
 * GET /api/sales-invoices/:id
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
    const invoice = await getSalesInvoiceById(tenantId, id);

    if (!invoice) {
      res.status(404).json({
        error: "Not found",
        message: "Sales invoice not found",
      });
      return;
    }

    res.status(200).json({
      message: "Sales invoice retrieved successfully",
      salesInvoice: invoice,
    });
  } catch (error: any) {
    console.error("Get sales invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve sales invoice",
    });
  }
}

/**
 * Update draft sales invoice
 * PUT /api/sales-invoices/:id
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
    const validatedInput = updateSalesInvoiceSchema.parse(req.body);

    const invoice = await updateSalesInvoice(tenantId, userId, id, validatedInput);

    res.status(200).json({
      message: "Sales invoice updated successfully",
      salesInvoice: invoice,
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
        "Sales invoice not found or does not belong to this tenant" ||
      error.message === "Only draft sales invoices can be edited" ||
      error.message === "Customer not found or does not belong to this tenant" ||
      error.message === "Sales order not found or does not belong to this customer" ||
      error.message ===
        "Shipping address not found or does not belong to this customer" ||
      error.message ===
        "Billing address not found or does not belong to this customer" ||
      error.message ===
        "One or more items not found or do not belong to this tenant"
    ) {
      const status =
        error.message ===
        "Sales invoice not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update sales invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update sales invoice",
    });
  }
}

/**
 * Cancel sales invoice
 * POST /api/sales-invoices/:id/cancel
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

    const invoice = await cancelSalesInvoice(tenantId, userId, id, reason);

    res.status(200).json({
      message: "Sales invoice cancelled successfully",
      salesInvoice: invoice,
    });
  } catch (error: any) {
    if (
      error.message ===
        "Sales invoice not found or does not belong to this tenant" ||
      error.message === "Sales invoice cannot be cancelled in its current status"
    ) {
      const status =
        error.message ===
        "Sales invoice not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Cancel sales invoice error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to cancel sales invoice",
    });
  }
}

/**
 * Get Sales Invoice Status Report
 * GET /api/sales-invoices/reports/status
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

    const validatedQuery = salesInvoiceStatusReportQuerySchema.parse(req.query);
    const report = await getStatusReport(
      tenantId,
      validatedQuery.fromDate,
      validatedQuery.toDate
    );

    res.status(200).json({
      message: "Sales invoice status report retrieved successfully",
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

    console.error("Get sales invoice status report error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve sales invoice status report",
    });
  }
}

