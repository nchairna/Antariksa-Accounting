"use strict";
/**
 * Authentication Routes
 *
 * Defines all authentication-related API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Public routes (require tenant context but not authentication)
 */
// Register user (admin-created users)
// POST /api/auth/register
router.post("/register", auth_controller_1.register);
// Login user
// POST /api/auth/login
router.post("/login", auth_controller_1.login);
/**
 * Protected routes (require authentication)
 */
// Get current user
// GET /api/auth/me
router.get("/me", auth_middleware_1.authenticateToken, auth_controller_1.getCurrentUser);
// Logout user
// POST /api/auth/logout
router.post("/logout", auth_middleware_1.authenticateToken, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map