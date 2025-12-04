/**
 * Tax Report Controller
 *
 * Express handlers for tax report endpoints
 */

import { Request, Response } from "express";
import {
  getTaxSummaryReport,
  getTaxDetailReport,
  getTaxByRateReport,
} from "../services/taxReport.service";
import {
  taxSummaryReportQuerySchema,
  taxDetailReportQuerySchema,
  taxByRateReportQuerySchema,
} from "../validators/report.validator";

/**
 * Get Tax Summary Report
 * GET /api/reports/tax/summary
 */
export async function getSummary(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = taxSummaryReportQuerySchema.parse(req.query);

    const report = await getTaxSummaryReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching tax summary report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch tax summary report",
    });
  }
}

/**
 * Get Tax Detail Report
 * GET /api/reports/tax/detail
 */
export async function getDetail(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = taxDetailReportQuerySchema.parse(req.query);

    const report = await getTaxDetailReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching tax detail report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch tax detail report",
    });
  }
}

/**
 * Get Tax by Rate Report
 * GET /api/reports/tax/by-rate
 */
export async function getByRate(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = taxByRateReportQuerySchema.parse(req.query);

    const report = await getTaxByRateReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching tax by rate report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch tax by rate report",
    });
  }
}

