/**
 * Category Routes
 * 
 * Defines all category-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/category.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All category routes require authentication
 */
router.use(authenticateToken);

/**
 * Category CRUD endpoints
 */

// Create category
// POST /api/categories
router.post("/", create);

// Get all categories
// Query params: ?tree=true (returns hierarchical tree structure)
// GET /api/categories
router.get("/", getAll);

// Get category by ID
// GET /api/categories/:id
router.get("/:id", getById);

// Update category
// PUT /api/categories/:id
router.put("/:id", update);

// Delete category
// DELETE /api/categories/:id
router.delete("/:id", remove);

export default router;

