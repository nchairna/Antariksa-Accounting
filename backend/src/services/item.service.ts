/**
 * Item Service
 * 
 * Business logic for item operations
 */

import { PrismaClient } from "../generated/prisma";
import { CreateItemInput, UpdateItemInput } from "../validators/item.validator";

const prisma = new PrismaClient();

export interface ItemResult {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  categoryId: string | null;
  brand: string | null;
  modelNumber: string | null;
  barcode: string | null;
  unitOfMeasurement: string;
  purchasePrice: any; // Decimal type from Prisma
  sellingPrice: any;
  wholesalePrice: any | null;
  currency: string;
  taxCategoryId: string | null;
  taxRate: any | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Create a new item
 * @param tenantId - Tenant ID (from tenant context)
 * @param input - Item data
 * @returns Created item
 */
export async function createItem(
  tenantId: string,
  input: CreateItemInput
): Promise<ItemResult> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if item code already exists in this tenant
  const existingItem = await prisma.item.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code: input.code.toUpperCase(), // Normalize to uppercase
      },
    },
  });

  if (existingItem) {
    throw new Error("Item code already exists in this tenant");
  }

  // Check if barcode already exists (if provided)
  if (input.barcode) {
    const existingBarcode = await prisma.item.findFirst({
      where: {
        tenantId,
        barcode: input.barcode,
      },
    });

    if (existingBarcode) {
      throw new Error("Barcode already exists in this tenant");
    }
  }

  // Validate category exists and belongs to tenant (if provided)
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        tenantId,
      },
    });

    if (!category) {
      throw new Error("Category not found or does not belong to this tenant");
    }
  }

  // Create item
  const item = await prisma.item.create({
    data: {
      tenantId,
      code: input.code.toUpperCase(),
      name: input.name,
      shortDescription: input.shortDescription || null,
      longDescription: input.longDescription || null,
      categoryId: input.categoryId || null,
      brand: input.brand || null,
      modelNumber: input.modelNumber || null,
      barcode: input.barcode || null,
      unitOfMeasurement: input.unitOfMeasurement || "PCS",
      purchasePrice: input.purchasePrice,
      sellingPrice: input.sellingPrice,
      wholesalePrice: input.wholesalePrice || null,
      currency: input.currency || "USD",
      taxCategoryId: input.taxCategoryId || null,
      taxRate: input.taxRate || null,
      status: input.status || "ACTIVE",
    },
  });

  return item;
}

/**
 * Get all items for a tenant with advanced filtering
 * @param tenantId - Tenant ID
 * @param filters - Optional filters
 * @returns List of items
 */
export async function getItems(
  tenantId: string,
  filters?: {
    categoryId?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    inStock?: boolean; // For future inventory integration
  }
): Promise<ItemResult[]> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null, // Only get non-deleted items
  };

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.brand) {
    where.brand = { contains: filters.brand, mode: "insensitive" };
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.sellingPrice = {};
    if (filters?.minPrice !== undefined) {
      where.sellingPrice.gte = filters.minPrice;
    }
    if (filters?.maxPrice !== undefined) {
      where.sellingPrice.lte = filters.maxPrice;
    }
  }

  // Search across multiple fields
  if (filters?.search) {
    where.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
      { barcode: { contains: filters.search, mode: "insensitive" } },
      { modelNumber: { contains: filters.search, mode: "insensitive" } },
      { shortDescription: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.item.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      code: "asc",
    },
  });

  return items as any;
}

/**
 * Get item by ID
 * @param itemId - Item ID
 * @param tenantId - Tenant ID (for security)
 * @returns Item or null
 */
export async function getItemById(
  itemId: string,
  tenantId: string
): Promise<ItemResult | null> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      tenantId,
      deletedAt: null,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return item as any;
}

/**
 * Update item
 * @param itemId - Item ID
 * @param tenantId - Tenant ID
 * @param input - Update data
 * @returns Updated item
 */
export async function updateItem(
  itemId: string,
  tenantId: string,
  input: UpdateItemInput
): Promise<ItemResult> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if item exists and belongs to tenant
  const existingItem = await prisma.item.findFirst({
    where: {
      id: itemId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existingItem) {
    throw new Error("Item not found or does not belong to this tenant");
  }

  // Check if new code conflicts (if code is being updated)
  if (input.code && input.code.toUpperCase() !== existingItem.code) {
    const codeConflict = await prisma.item.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: input.code.toUpperCase(),
        },
      },
    });

    if (codeConflict) {
      throw new Error("Item code already exists in this tenant");
    }
  }

  // Check if new barcode conflicts (if barcode is being updated)
  if (input.barcode !== undefined && input.barcode !== existingItem.barcode) {
    if (input.barcode) {
      const barcodeConflict = await prisma.item.findFirst({
        where: {
          tenantId,
          barcode: input.barcode,
          id: { not: itemId },
        },
      });

      if (barcodeConflict) {
        throw new Error("Barcode already exists in this tenant");
      }
    }
  }

  // Validate category (if being updated)
  if (input.categoryId !== undefined && input.categoryId !== existingItem.categoryId) {
    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          tenantId,
        },
      });

      if (!category) {
        throw new Error("Category not found or does not belong to this tenant");
      }
    }
  }

  // Build update data
  const updateData: any = {};
  if (input.code !== undefined) updateData.code = input.code.toUpperCase();
  if (input.name !== undefined) updateData.name = input.name;
  if (input.shortDescription !== undefined) updateData.shortDescription = input.shortDescription;
  if (input.longDescription !== undefined) updateData.longDescription = input.longDescription;
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.brand !== undefined) updateData.brand = input.brand;
  if (input.modelNumber !== undefined) updateData.modelNumber = input.modelNumber;
  if (input.barcode !== undefined) updateData.barcode = input.barcode;
  if (input.unitOfMeasurement !== undefined) updateData.unitOfMeasurement = input.unitOfMeasurement;
  if (input.purchasePrice !== undefined) updateData.purchasePrice = input.purchasePrice;
  if (input.sellingPrice !== undefined) updateData.sellingPrice = input.sellingPrice;
  if (input.wholesalePrice !== undefined) updateData.wholesalePrice = input.wholesalePrice;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.taxCategoryId !== undefined) updateData.taxCategoryId = input.taxCategoryId;
  if (input.taxRate !== undefined) updateData.taxRate = input.taxRate;
  if (input.status !== undefined) updateData.status = input.status;

  // Update item
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: updateData,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedItem as any;
}

/**
 * Delete item (soft delete)
 * @param itemId - Item ID
 * @param tenantId - Tenant ID
 */
export async function deleteItem(
  itemId: string,
  tenantId: string
): Promise<void> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if item exists and belongs to tenant
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!item) {
    throw new Error("Item not found or does not belong to this tenant");
  }

  // Soft delete: set deletedAt timestamp
  await prisma.item.update({
    where: { id: itemId },
    data: {
      deletedAt: new Date(),
    },
  });
}

