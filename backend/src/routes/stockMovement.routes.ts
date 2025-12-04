/**
 * Stock Movement Routes
 * 
 * API routes for stock movement operations
 */

import { Router } from "express";
import * as stockMovementController from "../controllers/stockMovement.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Stock movement queries
router.get("/", stockMovementController.getStockMovements);
router.get("/item/:itemId", stockMovementController.getMovementsByItem);
router.get("/location/:locationId", stockMovementController.getMovementsByLocation);
router.get("/:id", stockMovementController.getStockMovementById);

export default router;

