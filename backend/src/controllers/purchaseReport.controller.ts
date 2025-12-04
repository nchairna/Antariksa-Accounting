/**
 * Purchase Report Controller
 *
 * Express handlers for purchase report endpoints
 */

import { Request, Response } from "express";
import {
  getPurchaseSummaryReport,
  getPurchaseDetailReport,
  getPurchaseBySupplierReport,
  getPurchaseByItemReport,
} from "../services/purchaseReport.service";
import {
  purchaseSummaryReportQuerySchema,
  purchaseDetailReportQuerySchema,
  purchaseBySupplierReportQuerySchema,
  purchaseByItemReportQuerySchema,
} from "../validators/report.validator";

/**
 * Get Purchase Summary Report
 * GET /api/reports/purchase/summary
 */
export async function getSummary(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = purchaseSummaryReportQuerySchema.parse(req.query);

    const report = await getPurchaseSummaryReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching purchase summary report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch purchase summary report",
    });
  }
}

/**
 * Get Purchase Detail Report
 * GET /api/reports/purchase/detail
 */
export async function getDetail(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = purchaseDetailReportQuerySchema.parse(req.query);

    const report = await getPurchaseDetailReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching purchase detail report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch purchase detail report",
    });
  }
}

/**
 * Get Purchase by Supplier Report
 * GET /api/reports/purchase/by-supplier
 */
export async function getBySupplier(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = purchaseBySupplierReportQuerySchema.parse(req.query);

    const report = await getPurchaseBySupplierReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching purchase by supplier report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch purchase by supplier report",
    });
  }
}

/**
 * Get Purchase by Item Report
 * GET /api/reports/purchase/by-item
 */
export async function getByItem(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = purchaseByItemReportQuerySchema.parse(req.query);

    const report = await getPurchaseByItemReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching purchase by item report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch purchase by item report",
    });
  }
}

