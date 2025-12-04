/**
 * Payment Routes
 *
 * API routes for payment management
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  cancel,
  approve,
  getAROutstandingHandler,
  getARAgingHandler,
  getAPOutstandingHandler,
  getAPAgingHandler,
} from "../controllers/payment.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { tenantContextMiddleware } from "../middleware/tenantContext";

const router = Router();

// All routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantContextMiddleware);

// Payment CRUD
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.post("/:id/cancel", cancel);
router.post("/:id/approve", approve);

// Accounts Receivable (AR) endpoints
router.get("/ar/outstanding", getAROutstandingHandler);
router.get("/ar/aging", getARAgingHandler);

// Accounts Payable (AP) endpoints
router.get("/ap/outstanding", getAPOutstandingHandler);
router.get("/ap/aging", getAPAgingHandler);

export default router;

