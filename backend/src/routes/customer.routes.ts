/**
 * Customer Routes
 * 
 * Defines all customer-related API endpoints
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
} from "../controllers/customer.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * All customer routes require authentication
 */
router.use(authenticateToken);

/**
 * Customer CRUD endpoints
 */

// Create customer
// POST /api/customers
router.post("/", create);

// Get all customers (with optional filters: ?customerType=COMPANY&status=ACTIVE&search=xxx)
// GET /api/customers
router.get("/", getAll);

// Get customer by ID
// GET /api/customers/:id
router.get("/:id", getById);

// Update customer
// PUT /api/customers/:id
router.put("/:id", update);

// Delete customer (soft delete)
// DELETE /api/customers/:id
router.delete("/:id", remove);

/**
 * Customer Address endpoints
 */

// Create customer address
// POST /api/customers/:id/addresses
router.post("/:id/addresses", createAddress);

// Get customer addresses
// GET /api/customers/:id/addresses
router.get("/:id/addresses", getAddresses);

// Update customer address
// PUT /api/customers/:id/addresses/:addressId
router.put("/:id/addresses/:addressId", updateAddress);

// Delete customer address
// DELETE /api/customers/:id/addresses/:addressId
router.delete("/:id/addresses/:addressId", deleteAddress);

export default router;



