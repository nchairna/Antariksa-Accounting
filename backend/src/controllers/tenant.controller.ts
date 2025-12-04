/**
 * Tenant Controller
 * 
 * Handles HTTP requests for tenant endpoints
 */

import { Request, Response } from "express";
import {
  getTenantById,
  updateTenant,
  getTenantSettings,
  getTenantSettingByKey,
  createTenantSetting,
  updateTenantSetting,
  deleteTenantSetting,
} from "../services/tenant.service";
import {
  updateTenantSchema,
  createTenantSettingSchema,
  updateTenantSettingSchema,
} from "../validators/tenant.validator";

/**
 * Get tenant by ID
 * GET /api/tenants/:id
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id;
    const tenant = await getTenantById(tenantId);

    if (!tenant) {
      res.status(404).json({
        error: "Not found",
        message: "Tenant not found",
      });
      return;
    }

    res.status(200).json({
      message: "Tenant retrieved successfully",
      tenant,
    });
  } catch (error: any) {
    console.error("Get tenant error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve tenant",
    });
  }
}

/**
 * Get current tenant (from JWT)
 * GET /api/tenants/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const tenant = await getTenantById(tenantId);

    if (!tenant) {
      res.status(404).json({
        error: "Not found",
        message: "Tenant not found",
      });
      return;
    }

    res.status(200).json({
      message: "Tenant retrieved successfully",
      tenant,
    });
  } catch (error: any) {
    console.error("Get tenant error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve tenant",
    });
  }
}

/**
 * Update tenant
 * PUT /api/tenants/:id
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id;
    const validatedInput = updateTenantSchema.parse(req.body);

    const tenant = await updateTenant(tenantId, validatedInput);

    res.status(200).json({
      message: "Tenant updated successfully",
      tenant,
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
      error.message === "Tenant not found" ||
      error.message === "Domain already exists"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update tenant error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update tenant",
    });
  }
}

/**
 * Get all tenant settings
 * GET /api/tenants/:id/settings
 */
export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id || (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const settings = await getTenantSettings(tenantId);

    res.status(200).json({
      message: "Tenant settings retrieved successfully",
      settings,
      count: settings.length,
    });
  } catch (error: any) {
    console.error("Get tenant settings error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve tenant settings",
    });
  }
}

/**
 * Get tenant setting by key
 * GET /api/tenants/:id/settings/:key
 */
export async function getSettingByKey(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id || (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const key = req.params.key;
    const setting = await getTenantSettingByKey(tenantId, key);

    if (!setting) {
      res.status(404).json({
        error: "Not found",
        message: "Setting not found",
      });
      return;
    }

    res.status(200).json({
      message: "Tenant setting retrieved successfully",
      setting,
    });
  } catch (error: any) {
    console.error("Get tenant setting error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve tenant setting",
    });
  }
}

/**
 * Create tenant setting
 * POST /api/tenants/:id/settings
 */
export async function createSetting(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id || (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const validatedInput = createTenantSettingSchema.parse(req.body);
    const setting = await createTenantSetting(tenantId, validatedInput);

    res.status(201).json({
      message: "Tenant setting created successfully",
      setting,
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

    if (error.message === "Setting key already exists for this tenant") {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create tenant setting error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create tenant setting",
    });
  }
}

/**
 * Update tenant setting
 * PUT /api/tenants/:id/settings/:key
 */
export async function updateSetting(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id || (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const key = req.params.key;
    const validatedInput = updateTenantSettingSchema.parse(req.body);

    const setting = await updateTenantSetting(tenantId, key, validatedInput);

    res.status(200).json({
      message: "Tenant setting updated successfully",
      setting,
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

    if (error.message === "Setting not found") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Update tenant setting error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update tenant setting",
    });
  }
}

/**
 * Delete tenant setting
 * DELETE /api/tenants/:id/settings/:key
 */
export async function deleteSetting(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.params.id || (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const key = req.params.key;
    await deleteTenantSetting(tenantId, key);

    res.status(200).json({
      message: "Tenant setting deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Setting not found") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete tenant setting error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete tenant setting",
    });
  }
}



