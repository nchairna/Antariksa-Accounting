/**
 * Purchase Invoice Routes
 *
 * Defines all purchase-invoice-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  approve,
  cancel,
  getStatusReportHandler,
} from "../controllers/purchaseInvoice.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All purchase invoice routes require authentication
router.use(authenticateToken);

// Create purchase invoice
// POST /api/purchase-invoices
router.post("/", create);

// Get all purchase invoices (with filters)
// GET /api/purchase-invoices
router.get("/", getAll);

// Purchase Invoice Reports (must come before /:id route)
// GET /api/purchase-invoices/reports/status
router.get("/reports/status", getStatusReportHandler);

// Get purchase invoice by ID
// GET /api/purchase-invoices/:id
router.get("/:id", getById);

// Update draft purchase invoice
// PUT /api/purchase-invoices/:id
router.put("/:id", update);

// Approve purchase invoice
// POST /api/purchase-invoices/:id/approve
router.post("/:id/approve", approve);

// Cancel purchase invoice
// POST /api/purchase-invoices/:id/cancel
router.post("/:id/cancel", cancel);

export default router;

