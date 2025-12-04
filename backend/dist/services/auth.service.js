"use strict";
/**
 * Authentication Service
 *
 * Business logic for authentication operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.getUserById = getUserById;
const prisma_1 = require("../generated/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const prisma_2 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Register a new user (admin-created)
 * @param tenantId - Tenant ID (from tenant context)
 * @param input - User registration data
 * @returns User and token
 */
async function registerUser(tenantId, input) {
    // Check if email already exists in this tenant
    const existingUser = await prisma.user.findUnique({
        where: {
            tenantId_email: {
                tenantId,
                email: input.email,
            },
        },
    });
    if (existingUser) {
        throw new Error("Email already exists in this tenant");
    }
    // Check if username already exists in this tenant
    const existingUsername = await prisma.user.findUnique({
        where: {
            tenantId_username: {
                tenantId,
                username: input.username,
            },
        },
    });
    if (existingUsername) {
        throw new Error("Username already exists in this tenant");
    }
    // Verify role exists and belongs to tenant (if provided)
    if (input.roleId) {
        const role = await prisma.role.findFirst({
            where: {
                id: input.roleId,
                tenantId,
            },
        });
        if (!role) {
            throw new Error("Role not found or does not belong to this tenant");
        }
    }
    // Hash password
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    // Create user
    const user = await prisma.user.create({
        data: {
            tenantId,
            email: input.email,
            username: input.username,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone || null,
            roleId: input.roleId || null,
            status: prisma_2.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            roleId: true,
            tenantId: true,
        },
    });
    // Generate JWT token
    const tokenPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        username: user.username,
        roleId: user.roleId || undefined,
    };
    const token = (0, jwt_1.generateToken)(tokenPayload);
    // Create user session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    const session = await prisma.userSession.create({
        data: {
            userId: user.id,
            tenantId: user.tenantId,
            token,
            expiresAt,
        },
    });
    return {
        user,
        token,
        sessionId: session.id,
    };
}
/**
 * Login user
 * @param tenantId - Tenant ID (from tenant context)
 * @param input - Login credentials
 * @param ipAddress - Client IP address (optional)
 * @param userAgent - Client user agent (optional)
 * @returns User and token
 */
async function loginUser(tenantId, input, ipAddress, userAgent) {
    // Find user by email in this tenant
    const user = await prisma.user.findUnique({
        where: {
            tenantId_email: {
                tenantId,
                email: input.email,
            },
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    // Check if user is active
    if (user.status !== prisma_2.UserStatus.ACTIVE) {
        throw new Error("User account is not active");
    }
    // Verify password
    const isValidPassword = await (0, password_1.verifyPassword)(input.password, user.passwordHash);
    if (!isValidPassword) {
        throw new Error("Invalid email or password");
    }
    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });
    // Generate JWT token
    const tokenPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        username: user.username,
        roleId: user.roleId || undefined,
    };
    const token = (0, jwt_1.generateToken)(tokenPayload);
    // Create user session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    const session = await prisma.userSession.create({
        data: {
            userId: user.id,
            tenantId: user.tenantId,
            token,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            expiresAt,
        },
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
            tenantId: user.tenantId,
        },
        token,
        sessionId: session.id,
    };
}
/**
 * Logout user (invalidate session)
 * @param token - JWT token to invalidate
 */
async function logoutUser(token) {
    // Delete session by token
    await prisma.userSession.deleteMany({
        where: {
            token,
        },
    });
}
/**
 * Get user by ID (for authenticated requests)
 * @param userId - User ID
 * @param tenantId - Tenant ID (for security)
 * @returns User or null
 */
async function getUserById(userId, tenantId) {
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            tenantId,
            status: prisma_2.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            roleId: true,
            tenantId: true,
        },
    });
    return user;
}
//# sourceMappingURL=auth.service.js.map