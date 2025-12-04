/**
 * Authentication Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * User Registration Schema
 * For admin-created users (no public registration)
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  phone: z
    .string()
    .optional()
    .nullable(),
  roleId: z
    .string()
    .uuid("Invalid role ID")
    .optional()
    .nullable(),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Combined Tenant + User Signup Schema
 * For public registration (creates tenant and first user)
 */
export const signupSchema = z.object({
  // Tenant fields
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be at most 200 characters"),
  companyCode: z
    .string()
    .min(2, "Company code must be at least 2 characters")
    .max(50, "Company code must be at most 50 characters")
    .regex(/^[A-Z0-9_]+$/, "Company code can only contain uppercase letters, numbers, and underscores")
    .optional(),
  domain: z
    .string()
    .max(255, "Domain must be at most 255 characters")
    .optional()
    .nullable(),
  
  // User fields
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  phone: z
    .string()
    .optional()
    .nullable(),
});

/**
 * Type exports for TypeScript
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;



