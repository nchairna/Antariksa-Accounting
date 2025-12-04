/**
 * Item Controller
 * 
 * Handles HTTP requests for item endpoints
 */

import { Request, Response } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../services/item.service";
import { createItemSchema, updateItemSchema } from "../validators/item.validator";

/**
 * Create a new item
 * POST /api/items
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedInput = createItemSchema.parse(req.body);
    const item = await createItem(tenantId, validatedInput);

    res.status(201).json({
      message: "Item created successfully",
      item,
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

    if (
      error.message === "Item code already exists in this tenant" ||
      error.message === "Barcode already exists in this tenant" ||
      error.message === "Category not found or does not belong to this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create item error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create item",
    });
  }
}

/**
 * Get all items
 * GET /api/items
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    // Extract query parameters for filtering
    const filters: any = {};
    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId as string;
    }
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    if (req.query.brand) {
      filters.brand = req.query.brand as string;
    }
    if (req.query.minPrice) {
      filters.minPrice = parseFloat(req.query.minPrice as string);
      if (isNaN(filters.minPrice)) {
        res.status(400).json({
          error: "Validation error",
          message: "minPrice must be a valid number",
        });
        return;
      }
    }
    if (req.query.maxPrice) {
      filters.maxPrice = parseFloat(req.query.maxPrice as string);
      if (isNaN(filters.maxPrice)) {
        res.status(400).json({
          error: "Validation error",
          message: "maxPrice must be a valid number",
        });
        return;
      }
    }

    const items = await getItems(tenantId, filters);

    res.status(200).json({
      message: "Items retrieved successfully",
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error("Get items error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve items",
    });
  }
}

/**
 * Get item by ID
 * GET /api/items/:id
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const itemId = req.params.id;
    const item = await getItemById(itemId, tenantId);

    if (!item) {
      res.status(404).json({
        error: "Not found",
        message: "Item not found",
      });
      return;
    }

    res.status(200).json({
      message: "Item retrieved successfully",
      item,
    });
  } catch (error: any) {
    console.error("Get item error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve item",
    });
  }
}

/**
 * Update item
 * PUT /api/items/:id
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const itemId = req.params.id;
    const validatedInput = updateItemSchema.parse(req.body);

    const item = await updateItem(itemId, tenantId, validatedInput);

    res.status(200).json({
      message: "Item updated successfully",
      item,
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

    if (
      error.message === "Item not found or does not belong to this tenant" ||
      error.message === "Item code already exists in this tenant" ||
      error.message === "Barcode already exists in this tenant" ||
      error.message === "Category not found or does not belong to this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update item error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update item",
    });
  }
}

/**
 * Delete item (soft delete)
 * DELETE /api/items/:id
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const itemId = req.params.id;
    await deleteItem(itemId, tenantId);

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Item not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete item error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete item",
    });
  }
}

