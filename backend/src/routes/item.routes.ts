/**
 * Item Routes
 * 
 * Defines all item-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/item.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All item routes require authentication
 */
router.use(authenticateToken);

/**
 * Item CRUD endpoints
 */

// Create item
// POST /api/items
router.post("/", create);

// Get all items (with optional filters)
// Query params: ?categoryId=xxx&status=ACTIVE&search=xxx&brand=xxx&minPrice=10&maxPrice=100
// GET /api/items
router.get("/", getAll);

// Get item by ID
// GET /api/items/:id
router.get("/:id", getById);

// Update item
// PUT /api/items/:id
router.put("/:id", update);

// Delete item (soft delete)
// DELETE /api/items/:id
router.delete("/:id", remove);

export default router;

