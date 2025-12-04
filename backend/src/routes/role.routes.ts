/**
 * Role Routes
 * 
 * Defines all role-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
  assignPermissions,
  getAllPermissions,
} from "../controllers/role.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All role routes require authentication
 */
router.use(authenticateToken);

/**
 * Permission endpoints (global, not tenant-specific)
 * Must be defined BEFORE /:id routes to avoid route conflicts
 */

// Get all permissions
// GET /api/permissions
router.get("/permissions", getAllPermissions);

/**
 * Role CRUD endpoints
 */

// Create role
// POST /api/roles
router.post("/", create);

// Get all roles (with optional ?permissions=true to include permissions)
// GET /api/roles
router.get("/", getAll);

// Get role by ID
// GET /api/roles/:id
router.get("/:id", getById);

// Update role
// PUT /api/roles/:id
router.put("/:id", update);

// Delete role
// DELETE /api/roles/:id
router.delete("/:id", remove);

/**
 * Role-Permission endpoints
 */

// Assign permissions to role
// POST /api/roles/:id/permissions
router.post("/:id/permissions", assignPermissions);

export default router;

