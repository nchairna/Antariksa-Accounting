/**
 * Category Service
 * 
 * Business logic for category operations
 */

import { PrismaClient } from "../generated/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

const prisma = new PrismaClient();

export interface CategoryResult {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new category
 * @param tenantId - Tenant ID (from tenant context)
 * @param input - Category data
 * @returns Created category
 */
export async function createCategory(
  tenantId: string,
  input: CreateCategoryInput
): Promise<CategoryResult> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if category name already exists in this tenant
  const existingCategory = await prisma.category.findUnique({
    where: {
      tenantId_name: {
        tenantId,
        name: input.name,
      },
    },
  });

  if (existingCategory) {
    throw new Error("Category name already exists in this tenant");
  }

  // Validate parent category exists and belongs to tenant (if provided)
  if (input.parentId) {
    const parentCategory = await prisma.category.findFirst({
      where: {
        id: input.parentId,
        tenantId,
      },
    });

    if (!parentCategory) {
      throw new Error("Parent category not found or does not belong to this tenant");
    }
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description || null,
      parentId: input.parentId || null,
      sortOrder: input.sortOrder || null,
    },
  });

  return category;
}

/**
 * Get all categories for a tenant
 * @param tenantId - Tenant ID
 * @param includeTree - If true, returns hierarchical tree structure
 * @returns List of categories
 */
export async function getCategories(
  tenantId: string,
  includeTree: boolean = false
): Promise<CategoryResult[]> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const categories = await prisma.category.findMany({
    where: {
      tenantId,
    },
    include: {
      _count: {
        select: {
          children: true,
          items: true,
        },
      },
    },
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });

  // If tree structure requested, organize hierarchically
  if (includeTree) {
    return buildCategoryTree(categories as any);
  }

  return categories;
}

/**
 * Build hierarchical category tree
 */
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // First pass: create map of all categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build tree structure
  categories.forEach((cat) => {
    const categoryNode = categoryMap.get(cat.id);
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryNode);
      } else {
        // Parent not found, treat as root
        rootCategories.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

/**
 * Get category by ID
 * @param categoryId - Category ID
 * @param tenantId - Tenant ID (for security)
 * @returns Category or null
 */
export async function getCategoryById(
  categoryId: string,
  tenantId: string
): Promise<CategoryResult | null> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      tenantId,
    },
  });

  return category;
}

/**
 * Update category
 * @param categoryId - Category ID
 * @param tenantId - Tenant ID
 * @param input - Update data
 * @returns Updated category
 */
export async function updateCategory(
  categoryId: string,
  tenantId: string,
  input: UpdateCategoryInput
): Promise<CategoryResult> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if category exists and belongs to tenant
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      tenantId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found or does not belong to this tenant");
  }

  // Check if new name conflicts (if name is being updated)
  if (input.name && input.name !== existingCategory.name) {
    const nameConflict = await prisma.category.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: input.name,
        },
      },
    });

    if (nameConflict) {
      throw new Error("Category name already exists in this tenant");
    }
  }

  // Validate parent category (if being updated)
  if (input.parentId !== undefined) {
    if (input.parentId === categoryId) {
      throw new Error("Category cannot be its own parent");
    }

    if (input.parentId) {
      const parentCategory = await prisma.category.findFirst({
        where: {
          id: input.parentId,
          tenantId,
        },
      });

      if (!parentCategory) {
        throw new Error("Parent category not found or does not belong to this tenant");
      }

      // Prevent circular references (check if parent is a descendant)
      // Simple check: prevent direct parent-child loops
      const wouldCreateLoop = await checkCategoryLoop(categoryId, input.parentId, tenantId);
      if (wouldCreateLoop) {
        throw new Error("Cannot set parent: would create circular reference");
      }
    }
  }

  // Update category
  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name,
      description: input.description !== undefined ? input.description : undefined,
      parentId: input.parentId !== undefined ? input.parentId : undefined,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : undefined,
    },
  });

  return updatedCategory;
}

/**
 * Delete category
 * @param categoryId - Category ID
 * @param tenantId - Tenant ID
 */
export async function deleteCategory(
  categoryId: string,
  tenantId: string
): Promise<void> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if category exists and belongs to tenant
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      tenantId,
    },
    include: {
      children: true,
      items: true,
    },
  });

  if (!category) {
    throw new Error("Category not found or does not belong to this tenant");
  }

  // Check if category has children
  if (category.children.length > 0) {
    throw new Error("Cannot delete category: has child categories. Delete or move children first.");
  }

  // Check if category has items
  if (category.items.length > 0) {
    throw new Error("Cannot delete category: has items. Remove or reassign items first.");
  }

  // Delete category
  await prisma.category.delete({
    where: { id: categoryId },
  });
}

/**
 * Helper: Check if setting a parent would create a circular reference
 */
async function checkCategoryLoop(
  categoryId: string,
  newParentId: string,
  tenantId: string
): Promise<boolean> {
  let currentId: string | null = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) {
      return true; // Would create a loop
    }
    if (visited.has(currentId)) {
      break; // Already checked this branch
    }
    visited.add(currentId);

    const parent: { parentId: string | null } | null = await prisma.category.findFirst({
      where: {
        id: currentId,
        tenantId,
      },
      select: { parentId: true },
    });

    currentId = parent?.parentId || null;
  }

  return false;
}

