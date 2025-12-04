/**
 * User Controller
 * 
 * Handles HTTP requests for user endpoints
 */

import { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  updateProfile,
  changePassword,
  deleteUser,
} from "../services/user.service";
import {
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/user.validator";

/**
 * Get all users
 * GET /api/users
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
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    if (req.query.roleId) {
      filters.roleId = req.query.roleId as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const users = await getUsers(tenantId, filters);

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
      count: users.length,
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve users",
    });
  }
}

/**
 * Get user by ID
 * GET /api/users/:id
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

    const userId = req.params.id;
    const user = await getUserById(userId, tenantId);

    if (!user) {
      res.status(404).json({
        error: "Not found",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve user",
    });
  }
}

/**
 * Update user
 * PUT /api/users/:id
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

    const userId = req.params.id;
    const validatedInput = updateUserSchema.parse(req.body);

    const user = await updateUser(userId, tenantId, validatedInput);

    res.status(200).json({
      message: "User updated successfully",
      user,
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
      error.message === "User not found or does not belong to this tenant" ||
      error.message === "Email already exists in this tenant" ||
      error.message === "Username already exists in this tenant" ||
      error.message === "Role not found or does not belong to this tenant"
    ) {
      res.status(409).json({
        error: "Conflict",
        message: error.message,
      });
      return;
    }

    console.error("Update user error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update user",
    });
  }
}

/**
 * Update user profile (self-update)
 * PUT /api/users/me/profile
 */
export async function updateMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      res.status(400).json({
        error: "Authentication required",
        message: "User must be authenticated",
      });
      return;
    }

    const validatedInput = updateProfileSchema.parse(req.body);
    const user = await updateProfile(userId, tenantId, validatedInput);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
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

    if (error.message === "User not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Update profile error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update profile",
    });
  }
}

/**
 * Change password
 * PUT /api/users/me/password
 */
export async function changeMyPassword(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      res.status(400).json({
        error: "Authentication required",
        message: "User must be authenticated",
      });
      return;
    }

    const validatedInput = changePasswordSchema.parse(req.body);
    await changePassword(userId, tenantId, validatedInput);

    res.status(200).json({
      message: "Password changed successfully",
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
      error.message === "User not found or does not belong to this tenant" ||
      error.message === "Current password is incorrect"
    ) {
      res.status(400).json({
        error: "Bad request",
        message: error.message,
      });
      return;
    }

    console.error("Change password error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to change password",
    });
  }
}

/**
 * Delete user (soft delete)
 * DELETE /api/users/:id
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

    const userId = req.params.id;
    await deleteUser(userId, tenantId);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "User not found or does not belong to this tenant") {
      res.status(404).json({
        error: "Not found",
        message: error.message,
      });
      return;
    }

    console.error("Delete user error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete user",
    });
  }
}

