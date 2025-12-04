/**
 * Customer Controller
 * 
 * Handles HTTP requests for customer endpoints
 */

import { Request, Response } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createCustomerAddress,
  getCustomerAddresses,
  updateCustomerAddress,
  deleteCustomerAddress,
} from "../services/customer.service";
import {
  createCustomerSchema,
  updateCustomerSchema,
  createCustomerAddressSchema,
  updateCustomerAddressSchema,
} from "../validators/customer.validator";

/**
 * Create a new customer
 * POST /api/customers
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

    const validatedInput = createCustomerSchema.parse(req.body);
    const customer = await createCustomer(tenantId, validatedInput);

    res.status(201).json({
      message: "Customer created successfully",
      customer,
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
      error.message === "Customer code already exists in this tenant" ||
      error.message === "Email already exists in this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Create customer error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create customer",
    });
  }
}

/**
 * Get all customers
 * GET /api/customers
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
    if (req.query.customerType) {
      filters.customerType = req.query.customerType as string;
    }
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const customers = await getCustomers(tenantId, filters);

    res.status(200).json({
      message: "Customers retrieved successfully",
      customers,
      count: customers.length,
    });
  } catch (error: any) {
    console.error("Get customers error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve customers",
    });
  }
}

/**
 * Get customer by ID
 * GET /api/customers/:id
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

    const customerId = req.params.id;
    const customer = await getCustomerById(customerId, tenantId);

    if (!customer) {
      res.status(404).json({
        error: "Not found",
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      message: "Customer retrieved successfully",
      customer,
    });
  } catch (error: any) {
    console.error("Get customer error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve customer",
    });
  }
}

/**
 * Update customer
 * PUT /api/customers/:id
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

    const customerId = req.params.id;
    const validatedInput = updateCustomerSchema.parse(req.body);

    const customer = await updateCustomer(customerId, tenantId, validatedInput);

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
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
      error.message === "Customer not found or does not belong to this tenant" ||
      error.message === "Customer code already exists in this tenant" ||
      error.message === "Email already exists in this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update customer error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update customer",
    });
  }
}

/**
 * Delete customer (soft delete)
 * DELETE /api/customers/:id
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

    const customerId = req.params.id;
    await deleteCustomer(customerId, tenantId);

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Customer not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete customer error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete customer",
    });
  }
}

/**
 * Create customer address
 * POST /api/customers/:id/addresses
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

    const customerId = req.params.id;
    const validatedInput = createCustomerAddressSchema.parse(req.body);

    const address = await createCustomerAddress(customerId, tenantId, validatedInput);

    res.status(201).json({
      message: "Customer address created successfully",
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

    if (error.message === "Customer not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Create customer address error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create customer address",
    });
  }
}

/**
 * Get customer addresses
 * GET /api/customers/:id/addresses
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

    const customerId = req.params.id;
    const addresses = await getCustomerAddresses(customerId, tenantId);

    res.status(200).json({
      message: "Customer addresses retrieved successfully",
      addresses,
      count: addresses.length,
    });
  } catch (error: any) {
    console.error("Get customer addresses error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve customer addresses",
    });
  }
}

/**
 * Update customer address
 * PUT /api/customers/:id/addresses/:addressId
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

    const customerId = req.params.id;
    const addressId = req.params.addressId;
    const validatedInput = updateCustomerAddressSchema.parse(req.body);

    const address = await updateCustomerAddress(addressId, customerId, tenantId, validatedInput);

    res.status(200).json({
      message: "Customer address updated successfully",
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

    if (error.message === "Address not found or does not belong to this customer") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Update customer address error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update customer address",
    });
  }
}

/**
 * Delete customer address
 * DELETE /api/customers/:id/addresses/:addressId
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

    const customerId = req.params.id;
    const addressId = req.params.addressId;
    await deleteCustomerAddress(addressId, customerId, tenantId);

    res.status(200).json({
      message: "Customer address deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Address not found or does not belong to this customer") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete customer address error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete customer address",
    });
  }
}



