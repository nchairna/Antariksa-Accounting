/**
 * Sales Invoice Routes
 *
 * Defines all sales-invoice-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  cancel,
  getStatusReportHandler,
} from "../controllers/salesInvoice.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All sales invoice routes require authentication
router.use(authenticateToken);

// Create sales invoice
// POST /api/sales-invoices
router.post("/", create);

// Get all sales invoices (with filters)
// GET /api/sales-invoices
router.get("/", getAll);

// Sales Invoice Reports (must come before /:id route)
// GET /api/sales-invoices/reports/status
router.get("/reports/status", getStatusReportHandler);

// Get sales invoice by ID
// GET /api/sales-invoices/:id
router.get("/:id", getById);

// Update draft sales invoice
// PUT /api/sales-invoices/:id
router.put("/:id", update);

// Cancel sales invoice
// POST /api/sales-invoices/:id/cancel
router.post("/:id/cancel", cancel);

export default router;

