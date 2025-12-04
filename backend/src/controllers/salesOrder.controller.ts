/**
 * Sales Order Controller
 *
 * Handles HTTP requests for sales order endpoints
 */

import { Request, Response } from "express";
import {
  createSalesOrder,
  listSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  cancelSalesOrder,
  getStatusReport,
  getSoVsDeliveryReport,
} from "../services/salesOrder.service";
import {
  createDeliveryNote,
} from "../services/deliveryNote.service";
import {
  createSalesOrderSchema,
  salesOrderListQuerySchema,
  updateSalesOrderSchema,
  soStatusReportQuerySchema,
  soVsDeliveryReportQuerySchema,
  createDeliveryNoteSchema,
} from "../validators/salesOrder.validator";

/**
 * Create a new sales order
 * POST /api/sales-orders
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

    const validatedInput = createSalesOrderSchema.parse(req.body);
    const so = await createSalesOrder(tenantId, userId, validatedInput);

    res.status(201).json({
      message: "Sales order created successfully",
      salesOrder: so,
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

    console.error("Create sales order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create sales order",
    });
  }
}

/**
 * List sales orders
 * GET /api/sales-orders
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

    const validatedQuery = salesOrderListQuerySchema.parse(req.query);
    const result = await listSalesOrders(tenantId, validatedQuery);

    res.status(200).json({
      message: "Sales orders retrieved successfully",
      salesOrders: result.salesOrders,
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

    console.error("Get sales orders error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve sales orders",
    });
  }
}

/**
 * Get sales order by ID
 * GET /api/sales-orders/:id
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
    const so = await getSalesOrderById(tenantId, id);

    if (!so) {
      res.status(404).json({
        error: "Not found",
        message: "Sales order not found",
      });
      return;
    }

    res.status(200).json({
      message: "Sales order retrieved successfully",
      salesOrder: so,
    });
  } catch (error: any) {
    console.error("Get sales order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve sales order",
    });
  }
}

/**
 * Update draft sales order
 * PUT /api/sales-orders/:id
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
    const validatedInput = updateSalesOrderSchema.parse(req.body);

    const so = await updateSalesOrder(tenantId, userId, id, validatedInput);

    res.status(200).json({
      message: "Sales order updated successfully",
      salesOrder: so,
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
        "Sales order not found or does not belong to this tenant" ||
      error.message === "Only draft sales orders can be edited" ||
      error.message === "Customer not found or does not belong to this tenant" ||
      error.message ===
        "Shipping address not found or does not belong to this customer" ||
      error.message ===
        "Billing address not found or does not belong to this customer" ||
      error.message ===
        "One or more items not found or do not belong to this tenant"
    ) {
      const status =
        error.message ===
        "Sales order not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update sales order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update sales order",
    });
  }
}

/**
 * Cancel sales order
 * POST /api/sales-orders/:id/cancel
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

    const so = await cancelSalesOrder(tenantId, userId, id, reason);

    res.status(200).json({
      message: "Sales order cancelled successfully",
      salesOrder: so,
    });
  } catch (error: any) {
    if (
      error.message ===
        "Sales order not found or does not belong to this tenant" ||
      error.message === "Sales order cannot be cancelled in its current status"
    ) {
      const status =
        error.message ===
        "Sales order not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Cancel sales order error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to cancel sales order",
    });
  }
}

/**
 * Get SO Status Report
 * GET /api/sales-orders/reports/status
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

    const validatedQuery = soStatusReportQuerySchema.parse(req.query);
    const report = await getStatusReport(
      tenantId,
      validatedQuery.fromDate,
      validatedQuery.toDate
    );

    res.status(200).json({
      message: "SO status report retrieved successfully",
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

    console.error("Get SO status report error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve SO status report",
    });
  }
}

/**
 * Get SO vs Delivery Report
 * GET /api/sales-orders/reports/so-vs-delivery
 */
export async function getSoVsDeliveryReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;

    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedQuery = soVsDeliveryReportQuerySchema.parse(req.query);
    const report = await getSoVsDeliveryReport(
      tenantId,
      validatedQuery.fromDate,
      validatedQuery.toDate,
      validatedQuery.customerId
    );

    res.status(200).json({
      message: "SO vs Delivery report retrieved successfully",
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

    console.error("Get SO vs Delivery report error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve SO vs Delivery report",
    });
  }
}

/**
 * Create Delivery Note (DN) from Sales Order
 * POST /api/sales-orders/:id/delivery-note
 */
export async function createDeliveryNoteHandler(req: Request, res: Response): Promise<void> {
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
    const validatedInput = createDeliveryNoteSchema.parse(req.body);

    const so = await createDeliveryNote(tenantId, userId, id, validatedInput);

    res.status(200).json({
      message: "Delivery note created successfully",
      salesOrder: so,
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
        "Sales order not found or does not belong to this tenant" ||
      error.message === "Cannot deliver goods for a cancelled sales order" ||
      error.message ===
        "One or more sales order lines not found or do not belong to this order" ||
      error.message ===
        "Delivered quantity exceeds ordered quantity for one or more lines" ||
      error.message?.includes("Insufficient stock") ||
      error.message ===
        "No default location found for tenant and no location specified for delivery line"
    ) {
      const status =
        error.message ===
        "Sales order not found or does not belong to this tenant"
          ? 404
          : 409;
      res.status(status).json({
        error: status === 404 ? "Not found" : "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create delivery note error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create delivery note",
    });
  }
}

