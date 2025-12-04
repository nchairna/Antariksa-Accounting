/**
 * Inventory Controller
 * 
 * HTTP request handlers for inventory operations
 */

import { Request, Response } from "express";
import * as inventoryService from "../services/inventory.service";
import {
  CreateItemInventoryInput,
  UpdateItemInventoryInput,
  InventoryQueryParams,
  StockAdjustmentInput,
  StockTransferInput,
} from "../validators/inventory.validator";

/**
 * Create or update item inventory
 */
export async function createOrUpdateInventory(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const input = CreateItemInventoryInput.parse(req.body);
    const inventory = await inventoryService.createOrUpdateItemInventory(tenantId, input, userId);

    res.status(201).json({
      message: "Inventory created/updated successfully",
      inventory,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to create/update inventory",
    });
  }
}

/**
 * Get all inventories
 */
export async function getInventories(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const query = InventoryQueryParams.parse(req.query);
    const result = await inventoryService.getInventories(tenantId, query);

    res.status(200).json({
      message: "Inventories retrieved successfully",
      inventories: result.inventories,
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
      message: error.message || "Failed to retrieve inventories",
    });
  }
}

/**
 * Get inventory by ID
 */
export async function getInventoryById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { id } = req.params;
    const inventory = await inventoryService.getInventoryById(tenantId, id);

    if (!inventory) {
      res.status(404).json({
        error: "Not Found",
        message: "Inventory not found",
      });
      return;
    }

    res.status(200).json({
      message: "Inventory retrieved successfully",
      inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve inventory",
    });
  }
}

/**
 * Get total stock for an item
 */
export async function getTotalStockByItem(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { itemId } = req.params;
    const stock = await inventoryService.getTotalStockByItem(tenantId, itemId);

    res.status(200).json({
      message: "Total stock retrieved successfully",
      itemId,
      ...stock,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve total stock",
    });
  }
}

/**
 * Update inventory
 */
export async function updateInventory(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { id } = req.params;
    const input = UpdateItemInventoryInput.parse(req.body);
    const inventory = await inventoryService.updateInventory(tenantId, id, input, userId);

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to update inventory",
    });
  }
}

/**
 * Adjust stock
 */
export async function adjustStock(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const input = StockAdjustmentInput.parse(req.body);
    const inventory = await inventoryService.adjustStock(tenantId, input, userId);

    res.status(200).json({
      message: "Stock adjusted successfully",
      inventory,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to adjust stock",
    });
  }
}

/**
 * Transfer stock
 */
export async function transferStock(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const input = StockTransferInput.parse(req.body);
    const result = await inventoryService.transferStock(tenantId, input, userId);

    res.status(200).json({
      message: "Stock transferred successfully",
      fromInventory: result.fromInventory,
      toInventory: result.toInventory,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: error.errors,
      });
      return;
    }

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to transfer stock",
    });
  }
}

