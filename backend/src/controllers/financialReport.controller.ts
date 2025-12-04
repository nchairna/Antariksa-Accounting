/**
 * Financial Report Controller
 *
 * Express handlers for financial statement endpoints
 */

import { Request, Response } from "express";
import {
  getProfitLossReport,
  getBalanceSheetReport,
  getCashFlowReport,
  getTrialBalanceReport,
} from "../services/financialReport.service";
import {
  profitLossReportQuerySchema,
  balanceSheetReportQuerySchema,
  cashFlowReportQuerySchema,
  trialBalanceReportQuerySchema,
} from "../validators/report.validator";

/**
 * Get Profit & Loss Report
 * GET /api/reports/financial/profit-loss
 */
export async function getProfitLoss(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = profitLossReportQuerySchema.parse(req.query);

    const report = await getProfitLossReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching profit & loss report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch profit & loss report",
    });
  }
}

/**
 * Get Balance Sheet Report
 * GET /api/reports/financial/balance-sheet
 */
export async function getBalanceSheet(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = balanceSheetReportQuerySchema.parse(req.query);

    const report = await getBalanceSheetReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching balance sheet report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch balance sheet report",
    });
  }
}

/**
 * Get Cash Flow Report
 * GET /api/reports/financial/cash-flow
 */
export async function getCashFlow(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = cashFlowReportQuerySchema.parse(req.query);

    const report = await getCashFlowReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching cash flow report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch cash flow report",
    });
  }
}

/**
 * Get Trial Balance Report
 * GET /api/reports/financial/trial-balance
 */
export async function getTrialBalance(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = trialBalanceReportQuerySchema.parse(req.query);

    const report = await getTrialBalanceReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching trial balance report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch trial balance report",
    });
  }
}

