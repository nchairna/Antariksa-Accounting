/**
 * Inventory Routes
 * 
 * API routes for inventory operations
 */

import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Inventory CRUD
router.post("/", inventoryController.createOrUpdateInventory);
router.get("/", inventoryController.getInventories);
router.get("/item/:itemId/total", inventoryController.getTotalStockByItem);
router.get("/:id", inventoryController.getInventoryById);
router.put("/:id", inventoryController.updateInventory);

// Stock operations
router.post("/adjust", inventoryController.adjustStock);
router.post("/transfer", inventoryController.transferStock);

export default router;

