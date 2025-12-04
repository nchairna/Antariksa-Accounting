/**
 * Tenant Routes
 * 
 * Defines all tenant-related API endpoints
 */

import { Router } from "express";
import {
  getById,
  getMe,
  update,
  getSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
} from "../controllers/tenant.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All tenant routes require authentication
 */
router.use(authenticateToken);

/**
 * Tenant CRUD endpoints
 */

// Get current tenant (from JWT)
// GET /api/tenants/me
router.get("/me", getMe);

// Get tenant by ID
// GET /api/tenants/:id
router.get("/:id", getById);

// Update tenant
// PUT /api/tenants/:id
router.put("/:id", update);

/**
 * Tenant Settings endpoints
 */

/**
 * Tenant Settings endpoints
 * Must be defined BEFORE /:id routes to avoid route conflicts
 */

// Get all tenant settings (me endpoint)
// GET /api/tenants/me/settings
router.get("/me/settings", getSettings);

// Get tenant setting by key (me endpoint)
// GET /api/tenants/me/settings/:key
router.get("/me/settings/:key", getSettingByKey);

// Create tenant setting (me endpoint)
// POST /api/tenants/me/settings
router.post("/me/settings", createSetting);

// Update tenant setting (me endpoint)
// PUT /api/tenants/me/settings/:key
router.put("/me/settings/:key", updateSetting);

// Delete tenant setting (me endpoint)
// DELETE /api/tenants/me/settings/:key
router.delete("/me/settings/:key", deleteSetting);

/**
 * Tenant Settings endpoints (by ID)
 */

// Get all tenant settings
// GET /api/tenants/:id/settings
router.get("/:id/settings", getSettings);

// Get tenant setting by key
// GET /api/tenants/:id/settings/:key
router.get("/:id/settings/:key", getSettingByKey);

// Create tenant setting
// POST /api/tenants/:id/settings
router.post("/:id/settings", createSetting);

// Update tenant setting
// PUT /api/tenants/:id/settings/:key
router.put("/:id/settings/:key", updateSetting);

// Delete tenant setting
// DELETE /api/tenants/:id/settings/:key
router.delete("/:id/settings/:key", deleteSetting);

export default router;

