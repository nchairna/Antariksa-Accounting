/**
 * Purchase Report Routes
 *
 * API routes for purchase reports
 */

import { Router } from "express";
import {
  getSummary,
  getDetail,
  getBySupplier,
  getByItem,
} from "../controllers/purchaseReport.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { tenantContextMiddleware } from "../middleware/tenantContext";

const router = Router();

// All routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantContextMiddleware);

// Purchase report endpoints
router.get("/summary", getSummary);
router.get("/detail", getDetail);
router.get("/by-supplier", getBySupplier);
router.get("/by-item", getByItem);

export default router;

