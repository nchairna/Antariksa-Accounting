/**
 * Purchase Order Routes
 *
 * Defines all purchase-order-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  cancel,
  createGrn,
  getStatusReportHandler,
  getPoVsReceiptReportHandler,
} from "../controllers/purchaseOrder.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All purchase order routes require authentication
router.use(authenticateToken);

// Create purchase order
// POST /api/purchase-orders
router.post("/", create);

// Get all purchase orders (with filters)
// GET /api/purchase-orders
router.get("/", getAll);

// PO Reports (must come before /:id route)
// GET /api/purchase-orders/reports/status
router.get("/reports/status", getStatusReportHandler);

// GET /api/purchase-orders/reports/po-vs-receipt
router.get("/reports/po-vs-receipt", getPoVsReceiptReportHandler);

// Get purchase order by ID
// GET /api/purchase-orders/:id
router.get("/:id", getById);

// Update draft purchase order
// PUT /api/purchase-orders/:id
router.put("/:id", update);

// Cancel purchase order
// POST /api/purchase-orders/:id/cancel
router.post("/:id/cancel", cancel);

// Create Goods Receipt (GRN) from purchase order
// POST /api/purchase-orders/:id/grn
router.post("/:id/grn", createGrn);

export default router;


