/**
 * Purchase Order Controller
 *
 * Handles HTTP requests for purchase order endpoints
 */

import { Request, Response } from "express";
import {
  createPurchaseOrder,
  listPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  cancelPurchaseOrder,
  getStatusReport,
  getPoVsReceiptReport,
} from "../services/purchaseOrder.service";
import {
  createPurchaseOrderSchema,
  purchaseOrderListQuerySchema,
  updatePurchaseOrderSchema,
  poStatusReportQuerySchema,
  poVsReceiptReportQuerySchema,
} from "../validators/purchaseOrder.validator";
import {
  createGoodsReceipt,
} from "../services/goodsReceipt.service";
import {
  createGoodsReceiptSchema,
} from "../validators/goodsReceipt.validator";

/**
 * Create a new purchase order
 * POST /api/purchase-orders
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

    const validatedInput = createPurchaseOrderSchema.parse(req.body);
    const po = await createPurchaseOrder(tenantId, userId, validatedInput);

    res.status(201).json({
      message: "Purchase order created successfully",
      purchaseOrder: po,
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

    console.error("Create purchase order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create purchase order",
    });
  }
}

/**
 * List purchase orders
 * GET /api/purchase-orders
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

    const validatedQuery = purchaseOrderListQuerySchema.parse(req.query);
    const result = await listPurchaseOrders(tenantId, validatedQuery);

    res.status(200).json({
      message: "Purchase orders retrieved successfully",
      purchaseOrders: result.purchaseOrders,
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

    console.error("Get purchase orders error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve purchase orders",
    });
  }
}

/**
 * Get purchase order by ID
 * GET /api/purchase-orders/:id
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
    const po = await getPurchaseOrderById(tenantId, id);

    if (!po) {
      res.status(404).json({
        error: "Not found",
        message: "Purchase order not found",
      });
      return;
    }

    res.status(200).json({
      message: "Purchase order retrieved successfully",
      purchaseOrder: po,
    });
  } catch (error: any) {
    console.error("Get purchase order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve purchase order",
    });
  }
}

/**
 * Update draft purchase order
 * PUT /api/purchase-orders/:id
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
    const validatedInput = updatePurchaseOrderSchema.parse(req.body);

    const po = await updatePurchaseOrder(tenantId, userId, id, validatedInput);

    res.status(200).json({
      message: "Purchase order updated successfully",
      purchaseOrder: po,
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
        "Purchase order not found or does not belong to this tenant" ||
      error.message === "Only draft purchase orders can be edited" ||
      error.message === "Supplier not found or does not belong to this tenant" ||
      error.message ===
        "Shipping address not found or does not belong to this supplier" ||
      error.message ===
        "Billing address not found or does not belong to this supplier" ||
      error.message ===
        "One or more items not found or do not belong to this tenant"
    ) {
      const status =
        error.message ===
        "Purchase order not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update purchase order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update purchase order",
    });
  }
}

/**
 * Cancel purchase order
 * POST /api/purchase-orders/:id/cancel
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

    const po = await cancelPurchaseOrder(tenantId, userId, id, reason);

    res.status(200).json({
      message: "Purchase order cancelled successfully",
      purchaseOrder: po,
    });
  } catch (error: any) {
    if (
      error.message ===
        "Purchase order not found or does not belong to this tenant" ||
      error.message === "Purchase order cannot be cancelled in its current status"
    ) {
      const status =
        error.message ===
        "Purchase order not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Cancel purchase order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to cancel purchase order",
    });
  }
}

/**
 * Create Goods Receipt (GRN) from Purchase Order
 * POST /api/purchase-orders/:id/grn
 */
export async function createGrn(req: Request, res: Response): Promise<void> {
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
    const validatedInput = createGoodsReceiptSchema.parse(req.body);

    const po = await createGoodsReceipt(tenantId, userId, id, validatedInput);

    res.status(200).json({
      message: "Goods receipt created successfully",
      purchaseOrder: po,
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
        "Purchase order not found or does not belong to this tenant" ||
      error.message === "Cannot receive goods for a cancelled purchase order" ||
      error.message ===
        "One or more purchase order lines not found or do not belong to this order" ||
      error.message ===
        "Received quantity exceeds ordered quantity for one or more lines" ||
      error.message ===
        "No default location found for tenant and no location specified for GRN line"
    ) {
      const status =
        error.message ===
        "Purchase order not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create GRN error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create goods receipt",
    });
  }
}

/**
 * Get PO Status Report
 * GET /api/purchase-orders/reports/status
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

    const validatedQuery = poStatusReportQuerySchema.parse(req.query);
    const report = await getStatusReport(
      tenantId,
      validatedQuery.fromDate,
      validatedQuery.toDate
    );

    res.status(200).json({
      message: "PO status report retrieved successfully",
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

    console.error("Get PO status report error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve PO status report",
    });
  }
}

/**
 * Get PO vs Receipt Report
 * GET /api/purchase-orders/reports/po-vs-receipt
 */
export async function getPoVsReceiptReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedQuery = poVsReceiptReportQuerySchema.parse(req.query);
    const report = await getPoVsReceiptReport(
      tenantId,
      validatedQuery.fromDate,
      validatedQuery.toDate,
      validatedQuery.supplierId
    );

    res.status(200).json({
      message: "PO vs Receipt report retrieved successfully",
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

    console.error("Get PO vs Receipt report error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve PO vs Receipt report",
    });
  }
}

