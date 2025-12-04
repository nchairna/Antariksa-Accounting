/**
 * Category Controller
 * 
 * Handles HTTP requests for category endpoints
 */

import { Request, Response } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

/**
 * Create a new category
 * POST /api/categories
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

    const validatedInput = createCategorySchema.parse(req.body);
    const category = await createCategory(tenantId, validatedInput);

    res.status(201).json({
      message: "Category created successfully",
      category,
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
      error.message === "Category name already exists in this tenant" ||
      error.message === "Parent category not found or does not belong to this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create category error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create category",
    });
  }
}

/**
 * Get all categories
 * GET /api/categories
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

    // Check if tree structure is requested
    const includeTree = req.query.tree === "true";
    const categories = await getCategories(tenantId, includeTree);

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
      count: categories.length,
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve categories",
    });
  }
}

/**
 * Get category by ID
 * GET /api/categories/:id
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

    const categoryId = req.params.id;
    const category = await getCategoryById(categoryId, tenantId);

    if (!category) {
      res.status(404).json({
        error: "Not found",
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (error: any) {
    console.error("Get category error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve category",
    });
  }
}

/**
 * Update category
 * PUT /api/categories/:id
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

    const categoryId = req.params.id;
    const validatedInput = updateCategorySchema.parse(req.body);

    const category = await updateCategory(categoryId, tenantId, validatedInput);

    res.status(200).json({
      message: "Category updated successfully",
      category,
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
      error.message === "Category not found or does not belong to this tenant" ||
      error.message === "Category name already exists in this tenant" ||
      error.message === "Category cannot be its own parent" ||
      error.message === "Cannot set parent: would create circular reference"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update category error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update category",
    });
  }
}

/**
 * Delete category
 * DELETE /api/categories/:id
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

    const categoryId = req.params.id;
    await deleteCategory(categoryId, tenantId);

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    if (
      error.message === "Category not found or does not belong to this tenant" ||
      error.message === "Cannot delete category: has child categories. Delete or move children first." ||
      error.message === "Cannot delete category: has items. Remove or reassign items first."
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Delete category error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete category",
    });
  }
}

