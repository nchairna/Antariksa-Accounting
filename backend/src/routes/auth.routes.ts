/**
 * Authentication Routes
 * 
 * Defines all authentication-related API endpoints
 */

import { Router } from "express";
import { register, login, logout, getCurrentUser } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * Public routes (require tenant context but not authentication)
 */

// Register user (admin-created users)
// POST /api/auth/register
router.post("/register", register);

// Login user
// POST /api/auth/login
router.post("/login", login);

/**
 * Protected routes (require authentication)
 */

// Get current user
// GET /api/auth/me
router.get("/me", authenticateToken, getCurrentUser);

// Logout user
// POST /api/auth/logout
router.post("/logout", authenticateToken, logout);

export default router;



