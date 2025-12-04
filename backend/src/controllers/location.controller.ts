/**
 * Location Controller
 * 
 * HTTP request handlers for inventory location operations
 */

import { Request, Response } from "express";
import * as locationService from "../services/location.service";
import {
  CreateLocationInput,
  UpdateLocationInput,
  LocationQueryParams,
  CreateLocationInput as CreateLocationInputType,
} from "../validators/location.validator";

/**
 * Create a new location
 */
export async function createLocation(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const input: CreateLocationInputType = CreateLocationInput.parse(req.body);
    const location = await locationService.createLocation(tenantId, input);

    res.status(201).json({
      message: "Location created successfully",
      location,
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

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to create location",
    });
  }
}

/**
 * Get all locations
 */
export async function getLocations(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const query = LocationQueryParams.parse(req.query);
    const result = await locationService.getLocations(tenantId, query);

    res.status(200).json({
      message: "Locations retrieved successfully",
      locations: result.locations,
      count: result.count,
      page: query.page,
      limit: query.limit,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve locations",
    });
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { id } = req.params;
    const location = await locationService.getLocationById(tenantId, id);

    if (!location) {
      res.status(404).json({
        error: "Not Found",
        message: "Location not found",
      });
      return;
    }

    res.status(200).json({
      message: "Location retrieved successfully",
      location,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve location",
    });
  }
}

/**
 * Update location
 */
export async function updateLocation(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { id } = req.params;
    const input: UpdateLocationInput = UpdateLocationInput.parse(req.body);
    const location = await locationService.updateLocation(tenantId, id, input);

    res.status(200).json({
      message: "Location updated successfully",
      location,
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

    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to update location",
    });
  }
}

/**
 * Delete location
 */
export async function deleteLocation(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const { id } = req.params;
    await locationService.deleteLocation(tenantId, id);

    res.status(200).json({
      message: "Location deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      error: "Bad Request",
      message: error.message || "Failed to delete location",
    });
  }
}

/**
 * Get default location
 */
export async function getDefaultLocation(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized", message: "Tenant context required" });
      return;
    }

    const location = await locationService.getDefaultLocation(tenantId);

    if (!location) {
      res.status(404).json({
        error: "Not Found",
        message: "No default location found",
      });
      return;
    }

    res.status(200).json({
      message: "Default location retrieved successfully",
      location,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to retrieve default location",
    });
  }
}



