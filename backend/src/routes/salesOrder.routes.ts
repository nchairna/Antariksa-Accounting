/**
 * Sales Order Routes
 *
 * Defines all sales-order-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  cancel,
  getStatusReportHandler,
  getSoVsDeliveryReportHandler,
  createDeliveryNoteHandler,
} from "../controllers/salesOrder.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All sales order routes require authentication
router.use(authenticateToken);

// Create sales order
// POST /api/sales-orders
router.post("/", create);

// Get all sales orders (with filters)
// GET /api/sales-orders
router.get("/", getAll);

// SO Reports (must come before /:id route)
// GET /api/sales-orders/reports/status
router.get("/reports/status", getStatusReportHandler);

// GET /api/sales-orders/reports/so-vs-delivery
router.get("/reports/so-vs-delivery", getSoVsDeliveryReportHandler);

// Get sales order by ID
// GET /api/sales-orders/:id
router.get("/:id", getById);

// Update draft sales order
// PUT /api/sales-orders/:id
router.put("/:id", update);

// Cancel sales order
// POST /api/sales-orders/:id/cancel
router.post("/:id/cancel", cancel);

// Create Delivery Note (DN) from sales order
// POST /api/sales-orders/:id/delivery-note
router.post("/:id/delivery-note", createDeliveryNoteHandler);

export default router;

