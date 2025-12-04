/**
 * Financial Report Routes
 *
 * API routes for financial statements
 */

import { Router } from "express";
import {
  getProfitLoss,
  getBalanceSheet,
  getCashFlow,
  getTrialBalance,
} from "../controllers/financialReport.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { tenantContextMiddleware } from "../middleware/tenantContext";

const router = Router();

// All routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantContextMiddleware);

// Financial statement endpoints
router.get("/profit-loss", getProfitLoss);
router.get("/balance-sheet", getBalanceSheet);
router.get("/cash-flow", getCashFlow);
router.get("/trial-balance", getTrialBalance);

export default router;

