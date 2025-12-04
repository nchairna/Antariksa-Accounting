/**
 * Supplier Routes
 * 
 * Defines all supplier-related API endpoints
 */

import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/supplier.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All supplier routes require authentication
 */
router.use(authenticateToken);

/**
 * Supplier CRUD endpoints
 */

// Create supplier
// POST /api/suppliers
router.post("/", create);

// Get all suppliers (with optional filters: ?supplierType=DISTRIBUTOR&status=ACTIVE&search=xxx)
// GET /api/suppliers
router.get("/", getAll);

// Get supplier by ID
// GET /api/suppliers/:id
router.get("/:id", getById);

// Update supplier
// PUT /api/suppliers/:id
router.put("/:id", update);

// Delete supplier (soft delete)
// DELETE /api/suppliers/:id
router.delete("/:id", remove);

/**
 * Supplier Address endpoints
 */

// Create supplier address
// POST /api/suppliers/:id/addresses
router.post("/:id/addresses", createAddress);

// Get supplier addresses
// GET /api/suppliers/:id/addresses
router.get("/:id/addresses", getAddresses);

// Update supplier address
// PUT /api/suppliers/:id/addresses/:addressId
router.put("/:id/addresses/:addressId", updateAddress);

// Delete supplier address
// DELETE /api/suppliers/:id/addresses/:addressId
router.delete("/:id/addresses/:addressId", deleteAddress);

export default router;



