/**
 * Sales Report Routes
 *
 * API routes for sales reports
 */

import { Router } from "express";
import {
  getSummary,
  getDetail,
  getByCustomer,
  getByItem,
  getTrend,
} from "../controllers/salesReport.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { tenantContextMiddleware } from "../middleware/tenantContext";

const router = Router();

// All routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantContextMiddleware);

// Sales report endpoints
router.get("/summary", getSummary);
router.get("/detail", getDetail);
router.get("/by-customer", getByCustomer);
router.get("/by-item", getByItem);
router.get("/trend", getTrend);

export default router;

