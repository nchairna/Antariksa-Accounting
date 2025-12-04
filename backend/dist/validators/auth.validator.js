"use strict";
/**
 * Authentication Validation Schemas
 *
 * Uses Zod for input validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/**
 * User Registration Schema
 * For admin-created users (no public registration)
 */
exports.registerSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required"),
    username: zod_1.z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be at most 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    firstName: zod_1.z
        .string()
        .min(1, "First name is required")
        .max(100, "First name must be at most 100 characters"),
    lastName: zod_1.z
        .string()
        .min(1, "Last name is required")
        .max(100, "Last name must be at most 100 characters"),
    phone: zod_1.z
        .string()
        .optional()
        .nullable(),
    roleId: zod_1.z
        .string()
        .uuid("Invalid role ID")
        .optional()
        .nullable(),
});
/**
 * Login Schema
 */
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required"),
    password: zod_1.z
        .string()
        .min(1, "Password is required"),
});
//# sourceMappingURL=auth.validator.js.map