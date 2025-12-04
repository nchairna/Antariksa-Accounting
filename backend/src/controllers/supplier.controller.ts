/**
 * Supplier Controller
 * 
 * Handles HTTP requests for supplier endpoints
 */

import { Request, Response } from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  createSupplierAddress,
  getSupplierAddresses,
  updateSupplierAddress,
  deleteSupplierAddress,
} from "../services/supplier.service";
import {
  createSupplierSchema,
  updateSupplierSchema,
  createSupplierAddressSchema,
  updateSupplierAddressSchema,
} from "../validators/supplier.validator";

/**
 * Create a new supplier
 * POST /api/suppliers
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

    const validatedInput = createSupplierSchema.parse(req.body);
    const supplier = await createSupplier(tenantId, validatedInput);

    res.status(201).json({
      message: "Supplier created successfully",
      supplier,
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

    if (error.message === "Supplier code already exists in this tenant") {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create supplier error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create supplier",
    });
  }
}

/**
 * Get all suppliers
 * GET /api/suppliers
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

    const filters: any = {};
    if (req.query.supplierType) {
      filters.supplierType = req.query.supplierType as string;
    }
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const suppliers = await getSuppliers(tenantId, filters);

    res.status(200).json({
      message: "Suppliers retrieved successfully",
      suppliers,
      count: suppliers.length,
    });
  } catch (error: any) {
    console.error("Get suppliers error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve suppliers",
    });
  }
}

/**
 * Get supplier by ID
 * GET /api/suppliers/:id
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

    const supplierId = req.params.id;
    const supplier = await getSupplierById(supplierId, tenantId);

    if (!supplier) {
      res.status(404).json({
        error: "Not found",
        message: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      message: "Supplier retrieved successfully",
      supplier,
    });
  } catch (error: any) {
    console.error("Get supplier error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve supplier",
    });
  }
}

/**
 * Update supplier
 * PUT /api/suppliers/:id
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

    const supplierId = req.params.id;
    const validatedInput = updateSupplierSchema.parse(req.body);

    const supplier = await updateSupplier(supplierId, tenantId, validatedInput);

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier,
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
      error.message === "Supplier not found or does not belong to this tenant" ||
      error.message === "Supplier code already exists in this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update supplier error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update supplier",
    });
  }
}

/**
 * Delete supplier (soft delete)
 * DELETE /api/suppliers/:id
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

    const supplierId = req.params.id;
    await deleteSupplier(supplierId, tenantId);

    res.status(200).json({
      message: "Supplier deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Supplier not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete supplier error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete supplier",
    });
  }
}

/**
 * Create supplier address
 * POST /api/suppliers/:id/addresses
 */
export async function createAddress(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const supplierId = req.params.id;
    const validatedInput = createSupplierAddressSchema.parse(req.body);

    const address = await createSupplierAddress(supplierId, tenantId, validatedInput);

    res.status(201).json({
      message: "Supplier address created successfully",
      address,
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

    if (error.message === "Supplier not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Create supplier address error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create supplier address",
    });
  }
}

/**
 * Get supplier addresses
 * GET /api/suppliers/:id/addresses
 */
export async function getAddresses(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const supplierId = req.params.id;
    const addresses = await getSupplierAddresses(supplierId, tenantId);

    res.status(200).json({
      message: "Supplier addresses retrieved successfully",
      addresses,
      count: addresses.length,
    });
  } catch (error: any) {
    console.error("Get supplier addresses error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve supplier addresses",
    });
  }
}

/**
 * Update supplier address
 * PUT /api/suppliers/:id/addresses/:addressId
 */
export async function updateAddress(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const supplierId = req.params.id;
    const addressId = req.params.addressId;
    const validatedInput = updateSupplierAddressSchema.parse(req.body);

    const address = await updateSupplierAddress(addressId, supplierId, tenantId, validatedInput);

    res.status(200).json({
      message: "Supplier address updated successfully",
      address,
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

    if (error.message === "Address not found or does not belong to this supplier") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Update supplier address error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update supplier address",
    });
  }
}

/**
 * Delete supplier address
 * DELETE /api/suppliers/:id/addresses/:addressId
 */
export async function deleteAddress(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(400).json({
        error: "Tenant context required",
        message: "Tenant ID is required",
      });
      return;
    }

    const supplierId = req.params.id;
    const addressId = req.params.addressId;
    await deleteSupplierAddress(addressId, supplierId, tenantId);

    res.status(200).json({
      message: "Supplier address deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Address not found or does not belong to this supplier") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete supplier address error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete supplier address",
    });
  }
}



