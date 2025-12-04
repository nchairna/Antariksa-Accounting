/**
 * Customer Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Create Customer Schema
 */
export const createCustomerSchema = z.object({
  code: z
    .string()
    .min(1, "Customer code is required")
    .max(50, "Customer code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Customer code can only contain uppercase letters, numbers, underscores, and hyphens"),
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(200, "Customer name must be at most 200 characters"),
  customerType: z
    .enum(["INDIVIDUAL", "COMPANY", "GOVERNMENT"])
    .default("COMPANY"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(50, "Phone must be at most 50 characters")
    .optional()
    .nullable(),
  taxId: z
    .string()
    .max(100, "Tax ID must be at most 100 characters")
    .optional()
    .nullable(),
  creditLimit: z
    .number()
    .nonnegative("Credit limit must be non-negative")
    .finite("Credit limit must be a valid number")
    .optional()
    .nullable(),
  paymentTerms: z
    .string()
    .max(100, "Payment terms must be at most 100 characters")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .default("USD"),
  defaultDiscount: z
    .number()
    .min(0, "Discount must be non-negative")
    .max(1, "Discount must be between 0 and 1 (e.g., 0.1 for 10%)")
    .optional()
    .nullable(),
  priceListId: z
    .string()
    .uuid("Invalid price list ID")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "BLOCKED", "ON_HOLD"])
    .default("ACTIVE"),
});

/**
 * Update Customer Schema
 */
export const updateCustomerSchema = z.object({
  code: z
    .string()
    .min(1, "Customer code is required")
    .max(50, "Customer code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Customer code can only contain uppercase letters, numbers, underscores, and hyphens")
    .optional(),
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(200, "Customer name must be at most 200 characters")
    .optional(),
  customerType: z
    .enum(["INDIVIDUAL", "COMPANY", "GOVERNMENT"])
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(50, "Phone must be at most 50 characters")
    .optional()
    .nullable(),
  taxId: z
    .string()
    .max(100, "Tax ID must be at most 100 characters")
    .optional()
    .nullable(),
  creditLimit: z
    .number()
    .nonnegative("Credit limit must be non-negative")
    .finite("Credit limit must be a valid number")
    .optional()
    .nullable(),
  paymentTerms: z
    .string()
    .max(100, "Payment terms must be at most 100 characters")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .optional(),
  defaultDiscount: z
    .number()
    .min(0, "Discount must be non-negative")
    .max(1, "Discount must be between 0 and 1 (e.g., 0.1 for 10%)")
    .optional()
    .nullable(),
  priceListId: z
    .string()
    .uuid("Invalid price list ID")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "BLOCKED", "ON_HOLD"])
    .optional(),
});

/**
 * Create Customer Address Schema
 */
export const createCustomerAddressSchema = z.object({
  addressType: z
    .enum(["BILLING", "SHIPPING"]),
  streetAddress: z
    .string()
    .min(1, "Street address is required")
    .max(500, "Street address must be at most 500 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be at most 100 characters"),
  stateProvince: z
    .string()
    .max(100, "State/Province must be at most 100 characters")
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .max(20, "Postal code must be at most 20 characters")
    .optional()
    .nullable(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be at most 100 characters"),
  isDefault: z
    .boolean()
    .default(false),
});

/**
 * Update Customer Address Schema
 */
export const updateCustomerAddressSchema = z.object({
  addressType: z
    .enum(["BILLING", "SHIPPING"])
    .optional(),
  streetAddress: z
    .string()
    .min(1, "Street address is required")
    .max(500, "Street address must be at most 500 characters")
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be at most 100 characters")
    .optional(),
  stateProvince: z
    .string()
    .max(100, "State/Province must be at most 100 characters")
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .max(20, "Postal code must be at most 20 characters")
    .optional()
    .nullable(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be at most 100 characters")
    .optional(),
  isDefault: z
    .boolean()
    .optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateCustomerAddressInput = z.infer<typeof createCustomerAddressSchema>;
export type UpdateCustomerAddressInput = z.infer<typeof updateCustomerAddressSchema>;



