/**
 * Stock Movement Controller
 * 
 * HTTP request handlers for stock movement operations
 */

import { Request, Response } from "express";
import * as stockMovementService from "../services/stockMovement.service";
import { StockMovementQueryParams } from "../validators/stockMovement.validator";

/**
 * Get all stock movements
 */
export async function getStockMovements(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const query = StockMovementQueryParams.parse(req.query);
    const result = await stockMovementService.getStockMovements(tenantId, query);

    res.status(200).json({
      message: "Stock movements retrieved successfully",
      movements: result.movements,
      count: result.count,
      page: query.page,
      limit: query.limit,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve stock movements",
    });
  }
}

/**
 * Get stock movement by ID
 */
export async function getStockMovementById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { id } = req.params;
    const movement = await stockMovementService.getStockMovementById(tenantId, id);

    if (!movement) {
      res.status(404).json({
        error: "Not Found",
        message: "Stock movement not found",
      });
      return;
    }

    res.status(200).json({
      message: "Stock movement retrieved successfully",
      movement,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve stock movement",
    });
  }
}

/**
 * Get movements by item
 */
export async function getMovementsByItem(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { itemId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const movements = await stockMovementService.getMovementsByItem(tenantId, itemId, limit);

    res.status(200).json({
      message: "Stock movements retrieved successfully",
      movements,
      count: movements.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve stock movements",
    });
  }
}

/**
 * Get movements by location
 */
export async function getMovementsByLocation(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { locationId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const movements = await stockMovementService.getMovementsByLocation(tenantId, locationId, limit);

    res.status(200).json({
      message: "Stock movements retrieved successfully",
      movements,
      count: movements.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve stock movements",
    });
  }
}



