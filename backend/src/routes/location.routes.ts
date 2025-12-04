/**
 * Location Routes
 * 
 * API routes for inventory location operations
 */

import { Router } from "express";
import * as locationController from "../controllers/location.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Location CRUD
router.post("/", locationController.createLocation);
router.get("/", locationController.getLocations);
router.get("/default", locationController.getDefaultLocation);
router.get("/:id", locationController.getLocationById);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);

export default router;

