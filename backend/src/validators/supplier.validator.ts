/**
 * Supplier Validation Schemas
 * 
 * Uses Zod for input validation
 */

import { z } from "zod";

/**
 * Create Supplier Schema
 */
export const createSupplierSchema = z.object({
  code: z
    .string()
    .min(1, "Supplier code is required")
    .max(50, "Supplier code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Supplier code can only contain uppercase letters, numbers, underscores, and hyphens"),
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(200, "Supplier name must be at most 200 characters"),
  supplierType: z
    .enum(["MANUFACTURER", "DISTRIBUTOR", "WHOLESALER"])
    .default("DISTRIBUTOR"),
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
  paymentTerms: z
    .string()
    .max(100, "Payment terms must be at most 100 characters")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .default("USD"),
  bankName: z
    .string()
    .max(200, "Bank name must be at most 200 characters")
    .optional()
    .nullable(),
  bankAccountNumber: z
    .string()
    .max(100, "Bank account number must be at most 100 characters")
    .optional()
    .nullable(),
  bankRoutingNumber: z
    .string()
    .max(100, "Bank routing number must be at most 100 characters")
    .optional()
    .nullable(),
  swiftCode: z
    .string()
    .max(50, "SWIFT code must be at most 50 characters")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "BLOCKED", "ON_HOLD"])
    .default("ACTIVE"),
});

/**
 * Update Supplier Schema
 */
export const updateSupplierSchema = z.object({
  code: z
    .string()
    .min(1, "Supplier code is required")
    .max(50, "Supplier code must be at most 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Supplier code can only contain uppercase letters, numbers, underscores, and hyphens")
    .optional(),
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(200, "Supplier name must be at most 200 characters")
    .optional(),
  supplierType: z
    .enum(["MANUFACTURER", "DISTRIBUTOR", "WHOLESALER"])
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
  paymentTerms: z
    .string()
    .max(100, "Payment terms must be at most 100 characters")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .optional(),
  bankName: z
    .string()
    .max(200, "Bank name must be at most 200 characters")
    .optional()
    .nullable(),
  bankAccountNumber: z
    .string()
    .max(100, "Bank account number must be at most 100 characters")
    .optional()
    .nullable(),
  bankRoutingNumber: z
    .string()
    .max(100, "Bank routing number must be at most 100 characters")
    .optional()
    .nullable(),
  swiftCode: z
    .string()
    .max(50, "SWIFT code must be at most 50 characters")
    .optional()
    .nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "BLOCKED", "ON_HOLD"])
    .optional(),
});

/**
 * Create Supplier Address Schema (reuse from customer validator)
 */
export const createSupplierAddressSchema = z.object({
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
 * Update Supplier Address Schema
 */
export const updateSupplierAddressSchema = z.object({
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
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateSupplierAddressInput = z.infer<typeof createSupplierAddressSchema>;
export type UpdateSupplierAddressInput = z.infer<typeof updateSupplierAddressSchema>;



