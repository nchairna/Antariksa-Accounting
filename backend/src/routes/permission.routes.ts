/**
 * Permission Routes
 * 
 * Defines permission-related API endpoints
 */

import { Router } from "express";
import { getAllPermissions } from "../controllers/role.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * Permission routes require authentication
 */
router.use(authenticateToken);

// Get all permissions
// GET /api/permissions
router.get("/", getAllPermissions);

export default router;



