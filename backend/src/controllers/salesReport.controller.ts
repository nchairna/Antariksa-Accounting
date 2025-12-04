/**
 * Sales Report Controller
 *
 * Express handlers for sales report endpoints
 */

import { Request, Response } from "express";
import {
  getSalesSummaryReport,
  getSalesDetailReport,
  getSalesByCustomerReport,
  getSalesByItemReport,
  getSalesTrendAnalysis,
} from "../services/salesReport.service";
import {
  salesSummaryReportQuerySchema,
  salesDetailReportQuerySchema,
  salesByCustomerReportQuerySchema,
  salesByItemReportQuerySchema,
  salesTrendAnalysisQuerySchema,
} from "../validators/report.validator";

/**
 * Get Sales Summary Report
 * GET /api/reports/sales/summary
 */
export async function getSummary(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = salesSummaryReportQuerySchema.parse(req.query);

    const report = await getSalesSummaryReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching sales summary report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch sales summary report",
    });
  }
}

/**
 * Get Sales Detail Report
 * GET /api/reports/sales/detail
 */
export async function getDetail(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = salesDetailReportQuerySchema.parse(req.query);

    const report = await getSalesDetailReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching sales detail report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch sales detail report",
    });
  }
}

/**
 * Get Sales by Customer Report
 * GET /api/reports/sales/by-customer
 */
export async function getByCustomer(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = salesByCustomerReportQuerySchema.parse(req.query);

    const report = await getSalesByCustomerReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching sales by customer report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch sales by customer report",
    });
  }
}

/**
 * Get Sales by Item Report
 * GET /api/reports/sales/by-item
 */
export async function getByItem(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = salesByItemReportQuerySchema.parse(req.query);

    const report = await getSalesByItemReport(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching sales by item report:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch sales by item report",
    });
  }
}

/**
 * Get Sales Trend Analysis
 * GET /api/reports/sales/trend
 */
export async function getTrend(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId;
    const query = salesTrendAnalysisQuerySchema.parse(req.query);

    const report = await getSalesTrendAnalysis(tenantId, query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching sales trend analysis:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to fetch sales trend analysis",
    });
  }
}

