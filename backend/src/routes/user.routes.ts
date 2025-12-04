/**
 * User Routes
 * 
 * Defines all user-related API endpoints
 */

import { Router } from "express";
import {
  getAll,
  getById,
  update,
  updateMyProfile,
  changeMyPassword,
  remove,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All user routes require authentication
 */
router.use(authenticateToken);

/**
 * User CRUD endpoints
 */

// Get all users (with optional filters: ?status=ACTIVE&roleId=xxx&search=xxx)
// GET /api/users
router.get("/", getAll);

/**
 * User profile endpoints (self-management)
 * Must be defined BEFORE /:id routes to avoid route conflicts
 */

// Update own profile
// PUT /api/users/me/profile
router.put("/me/profile", updateMyProfile);

// Change own password
// PUT /api/users/me/password
router.put("/me/password", changeMyPassword);

/**
 * User CRUD endpoints
 */

// Get user by ID
// GET /api/users/:id
router.get("/:id", getById);

// Update user
// PUT /api/users/:id
router.put("/:id", update);

// Delete user (soft delete)
// DELETE /api/users/:id
router.delete("/:id", remove);

export default router;

