/**
 * Tax Report Routes
 *
 * API routes for tax reports
 */

import { Router } from "express";
import {
  getSummary,
  getDetail,
  getByRate,
} from "../controllers/taxReport.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { tenantContextMiddleware } from "../middleware/tenantContext";

const router = Router();

// All routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantContextMiddleware);

// Tax report endpoints
router.get("/summary", getSummary);
router.get("/detail", getDetail);
router.get("/by-rate", getByRate);

export default router;

