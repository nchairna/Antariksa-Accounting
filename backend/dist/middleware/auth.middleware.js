"use strict";
/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches user information to request
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jwt_1 = require("../utils/jwt");
const auth_service_1 = require("../services/auth.service");
/**
 * Authentication Middleware
 *
 * Verifies JWT token and attaches user to request
 * Also attaches token for logout functionality
 */
async function authenticateToken(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            res.status(401).json({
                error: "Unauthorized",
                message: "No token provided. Please include 'Authorization: Bearer <token>' header.",
            });
            return;
        }
        // Verify token
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Invalid or expired token",
            });
            return;
        }
        // Get tenant ID from request (set by tenant context middleware)
        const tenantId = req.tenantId;
        if (!tenantId) {
            res.status(400).json({
                error: "Tenant context required",
                message: "Tenant ID is required",
            });
            return;
        }
        // Verify tenant ID matches token
        if (payload.tenantId !== tenantId) {
            res.status(403).json({
                error: "Forbidden",
                message: "Token tenant does not match request tenant",
            });
            return;
        }
        // Get user from database (to ensure user still exists and is active)
        const user = await (0, auth_service_1.getUserById)(payload.userId, tenantId);
        if (!user) {
            res.status(401).json({
                error: "Unauthorized",
                message: "User not found or inactive",
            });
            return;
        }
        // Attach user and token to request
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: "Authentication failed",
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map