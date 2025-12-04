"use strict";
/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
/**
 * Register a new user (admin-created)
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        // Get tenant ID from request (set by tenant context middleware or from body)
        let tenantId = req.tenantId;
        // Fallback: Get tenantId from request body (for admin registration)
        if (!tenantId && req.body?.tenantId) {
            tenantId = req.body.tenantId;
        }
        if (!tenantId) {
            res.status(400).json({
                error: "Tenant context required",
                message: "Tenant ID is required for user registration. Provide via x-tenant-id header or in request body.",
            });
            return;
        }
        // Validate input
        const validatedInput = auth_validator_1.registerSchema.parse(req.body);
        // Register user
        const result = await (0, auth_service_1.registerUser)(tenantId, validatedInput);
        // Return user (without password) and token
        res.status(201).json({
            message: "User registered successfully",
            user: result.user,
            token: result.token,
        });
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({
                error: "Validation error",
                message: "Invalid input data",
                details: error.errors,
            });
            return;
        }
        if (error.message === "Email already exists in this tenant" ||
            error.message === "Username already exists in this tenant" ||
            error.message === "Role not found or does not belong to this tenant") {
            res.status(409).json({
                error: "Conflict",
                message: error.message,
            });
            return;
        }
        console.error("Registration error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: "Failed to register user",
        });
    }
}
/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        // Get tenant ID from request (set by tenant context middleware or from body)
        let tenantId = req.tenantId;
        // Fallback: Get tenantId from request body (for login convenience)
        if (!tenantId && req.body?.tenantId) {
            tenantId = req.body.tenantId;
        }
        if (!tenantId) {
            res.status(400).json({
                error: "Tenant context required",
                message: "Tenant ID is required for login. Provide via x-tenant-id header or in request body.",
            });
            return;
        }
        // Validate input
        const validatedInput = auth_validator_1.loginSchema.parse(req.body);
        // Get client info
        const ipAddress = req.ip || req.socket.remoteAddress || undefined;
        const userAgent = req.headers["user-agent"] || undefined;
        // Login user
        const result = await (0, auth_service_1.loginUser)(tenantId, validatedInput, ipAddress, userAgent);
        // Return user and token
        res.status(200).json({
            message: "Login successful",
            user: result.user,
            token: result.token,
        });
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({
                error: "Validation error",
                message: "Invalid input data",
                details: error.errors,
            });
            return;
        }
        if (error.message === "Invalid email or password" ||
            error.message === "User account is not active") {
            res.status(401).json({
                error: "Unauthorized",
                message: error.message,
            });
            return;
        }
        console.error("Login error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: "Failed to login",
        });
    }
}
/**
 * Logout user
 * POST /api/auth/logout
 */
async function logout(req, res) {
    try {
        // Get token from request (set by auth middleware)
        const token = req.token;
        if (!token) {
            res.status(401).json({
                error: "Unauthorized",
                message: "No token provided",
            });
            return;
        }
        // Logout user (invalidate session)
        await (0, auth_service_1.logoutUser)(token);
        res.status(200).json({
            message: "Logout successful",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: "Failed to logout",
        });
    }
}
/**
 * Get current user
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
    try {
        // Get user from request (set by auth middleware)
        const user = req.user;
        if (!user) {
            res.status(401).json({
                error: "Unauthorized",
                message: "User not authenticated",
            });
            return;
        }
        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                roleId: user.roleId,
                tenantId: user.tenantId,
            },
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: "Failed to get current user",
        });
    }
}
//# sourceMappingURL=auth.controller.js.map