/**
 * Inventory Service
 * 
 * Business logic for item inventory operations
 */

import { PrismaClient } from "../generated/prisma";
import {
  CreateItemInventoryInput,
  UpdateItemInventoryInput,
  InventoryQueryParams,
  StockAdjustmentInput,
  StockTransferInput,
} from "../validators/inventory.validator";
import { createStockMovement } from "./stockMovement.service";

const prisma = new PrismaClient();

export interface ItemInventoryResult {
  id: string;
  tenantId: string;
  itemId: string;
  locationId: string;
  quantity: any; // Decimal
  reservedQuantity: any; // Decimal
  availableQuantity: any; // Decimal
  minimumStockLevel: any | null; // Decimal
  maximumStockLevel: any | null; // Decimal
  reorderPoint: any | null; // Decimal
  lastCountedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  item?: any;
  location?: any;
}

/**
 * Create or update item inventory
 */
export async function createOrUpdateItemInventory(
  tenantId: string,
  input: CreateItemInventoryInput,
  userId?: string
): Promise<ItemInventoryResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Verify item exists and belongs to tenant
  const item = await prisma.item.findFirst({
    where: {
      id: input.itemId,
      tenantId,
    },
  });

  if (!item) {
    throw new Error("Item not found");
  }

  // Verify location exists and belongs to tenant
  const location = await prisma.inventoryLocation.findFirst({
    where: {
      id: input.locationId,
      tenantId,
    },
  });

  if (!location) {
    throw new Error("Location not found");
  }

  // Calculate available quantity
  const availableQuantity = Number(input.quantity) - Number(input.reservedQuantity || 0);

  // Check if inventory already exists
  const existing = await prisma.itemInventory.findUnique({
    where: {
      tenantId_itemId_locationId: {
        tenantId,
        itemId: input.itemId,
        locationId: input.locationId,
      },
    },
  });

  if (existing) {
    // Update existing inventory
    const quantityBefore = Number(existing.quantity);
    const quantityAfter = Number(input.quantity);

    const inventory = await prisma.itemInventory.update({
      where: {
        id: existing.id,
      },
      data: {
        quantity: input.quantity,
        reservedQuantity: input.reservedQuantity || 0,
        availableQuantity,
        minimumStockLevel: input.minimumStockLevel,
        maximumStockLevel: input.maximumStockLevel,
        reorderPoint: input.reorderPoint,
      },
    });

    // Log movement if quantity changed
    if (quantityBefore !== quantityAfter) {
      await createStockMovement(tenantId, {
        itemId: input.itemId,
        locationId: input.locationId,
        movementType: quantityAfter > quantityBefore ? "INBOUND" : "OUTBOUND",
        movementDate: new Date(),
        quantity: quantityAfter - quantityBefore,
        quantityBefore,
        quantityAfter,
        referenceType: "adjustment",
        referenceId: inventory.id,
        reason: "Inventory update",
      }, userId);
    }

    return inventory;
  } else {
    // Create new inventory
    const inventory = await prisma.itemInventory.create({
      data: {
        tenantId,
        itemId: input.itemId,
        locationId: input.locationId,
        quantity: input.quantity,
        reservedQuantity: input.reservedQuantity || 0,
        availableQuantity,
        minimumStockLevel: input.minimumStockLevel,
        maximumStockLevel: input.maximumStockLevel,
        reorderPoint: input.reorderPoint,
      },
    });

    // Log initial movement
    if (Number(input.quantity) > 0) {
      await createStockMovement(tenantId, {
        itemId: input.itemId,
        locationId: input.locationId,
        movementType: "INBOUND",
        movementDate: new Date(),
        quantity: input.quantity,
        quantityBefore: 0,
        quantityAfter: Number(input.quantity),
        referenceType: "initial",
        referenceId: inventory.id,
        reason: "Initial inventory setup",
      }, userId);
    }

    return inventory;
  }
}

/**
 * Get all inventory with filtering
 */
export async function getInventories(
  tenantId: string,
  query: InventoryQueryParams
): Promise<{ inventories: ItemInventoryResult[]; count: number }> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
  };

  if (query.itemId) {
    where.itemId = query.itemId;
  }

  if (query.locationId) {
    where.locationId = query.locationId;
  }

  if (query.lowStock) {
    // Low stock: quantity is below minimum stock level or at/below reorder point
    // Note: This requires a raw query for comparison, simplified for now
    // In production, consider using a database view or computed field
    where.OR = [
      {
        minimumStockLevel: { not: null },
      },
      {
        reorderPoint: { not: null },
      },
    ];
  }

  if (query.outOfStock) {
    where.quantity = 0;
  }

  const skip = (query.page - 1) * query.limit;

  const [inventories, count] = await Promise.all([
    prisma.itemInventory.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        item: {
          select: {
            id: true,
            code: true,
            name: true,
            unitOfMeasurement: true,
          },
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        { item: { name: "asc" } },
        { location: { name: "asc" } },
      ],
    }),
    prisma.itemInventory.count({ where }),
  ]);

  return { inventories, count };
}

/**
 * Get inventory by ID
 */
export async function getInventoryById(
  tenantId: string,
  inventoryId: string
): Promise<ItemInventoryResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const inventory = await prisma.itemInventory.findFirst({
    where: {
      id: inventoryId,
      tenantId,
    },
    include: {
      item: true,
      location: true,
    },
  });

  return inventory;
}

/**
 * Get inventory by item and location
 */
export async function getInventoryByItemAndLocation(
  tenantId: string,
  itemId: string,
  locationId: string
): Promise<ItemInventoryResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const inventory = await prisma.itemInventory.findUnique({
    where: {
      tenantId_itemId_locationId: {
        tenantId,
        itemId,
        locationId,
      },
    },
    include: {
      item: true,
      location: true,
    },
  });

  return inventory;
}

/**
 * Get total stock for an item across all locations
 */
export async function getTotalStockByItem(
  tenantId: string,
  itemId: string
): Promise<{ totalQuantity: number; totalReserved: number; totalAvailable: number }> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const result = await prisma.itemInventory.aggregate({
    where: {
      tenantId,
      itemId,
    },
    _sum: {
      quantity: true,
      reservedQuantity: true,
      availableQuantity: true,
    },
  });

  return {
    totalQuantity: Number(result._sum.quantity || 0),
    totalReserved: Number(result._sum.reservedQuantity || 0),
    totalAvailable: Number(result._sum.availableQuantity || 0),
  };
}

/**
 * Update inventory
 */
export async function updateInventory(
  tenantId: string,
  inventoryId: string,
  input: UpdateItemInventoryInput,
  userId?: string
): Promise<ItemInventoryResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existing = await prisma.itemInventory.findFirst({
    where: {
      id: inventoryId,
      tenantId,
    },
  });

  if (!existing) {
    throw new Error("Inventory not found");
  }

  const quantity = input.quantity !== undefined ? input.quantity : Number(existing.quantity);
  const reservedQuantity = input.reservedQuantity !== undefined ? input.reservedQuantity : Number(existing.reservedQuantity);
  const availableQuantity = quantity - reservedQuantity;

  const quantityBefore = Number(existing.quantity);
  const quantityAfter = quantity;

  const inventory = await prisma.itemInventory.update({
    where: {
      id: inventoryId,
    },
    data: {
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.reservedQuantity !== undefined && { reservedQuantity: input.reservedQuantity }),
      availableQuantity,
      ...(input.minimumStockLevel !== undefined && { minimumStockLevel: input.minimumStockLevel }),
      ...(input.maximumStockLevel !== undefined && { maximumStockLevel: input.maximumStockLevel }),
      ...(input.reorderPoint !== undefined && { reorderPoint: input.reorderPoint }),
    },
  });

  // Log movement if quantity changed
  if (quantityBefore !== quantityAfter) {
    await createStockMovement(tenantId, {
      itemId: existing.itemId,
      locationId: existing.locationId,
      movementType: quantityAfter > quantityBefore ? "INBOUND" : "OUTBOUND",
      movementDate: new Date(),
      quantity: quantityAfter - quantityBefore,
      quantityBefore,
      quantityAfter,
      referenceType: "adjustment",
      referenceId: inventory.id,
      reason: "Inventory adjustment",
    }, userId);
  }

  return inventory;
}

/**
 * Adjust stock (increase or decrease)
 */
export async function adjustStock(
  tenantId: string,
  input: StockAdjustmentInput,
  userId?: string
): Promise<ItemInventoryResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Get or create inventory
  let inventory = await getInventoryByItemAndLocation(tenantId, input.itemId, input.locationId);

  const quantityBefore = inventory ? Number(inventory.quantity) : 0;
  const quantityAfter = quantityBefore + Number(input.quantity);

  if (quantityAfter < 0) {
    throw new Error("Insufficient stock for adjustment");
  }

  if (!inventory) {
    // Create new inventory record
    inventory = await createOrUpdateItemInventory(tenantId, {
      itemId: input.itemId,
      locationId: input.locationId,
      quantity: quantityAfter,
      reservedQuantity: 0,
    }, userId);
  } else {
    // Update existing inventory
    inventory = await prisma.itemInventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: quantityAfter,
        availableQuantity: quantityAfter - Number(inventory.reservedQuantity),
      },
    });
  }

  // Log movement
  await createStockMovement(tenantId, {
    itemId: input.itemId,
    locationId: input.locationId,
    movementType: Number(input.quantity) > 0 ? "INBOUND" : "OUTBOUND",
    movementDate: new Date(),
    quantity: input.quantity,
    quantityBefore,
    quantityAfter,
    referenceType: "adjustment",
    referenceId: inventory.id,
    costPerUnit: input.costPerUnit,
    totalCost: input.costPerUnit ? Number(input.costPerUnit) * Math.abs(Number(input.quantity)) : null,
    reason: input.reason || "Stock adjustment",
  }, userId);

  return inventory;
}

/**
 * Transfer stock between locations
 */
export async function transferStock(
  tenantId: string,
  input: StockTransferInput,
  userId?: string
): Promise<{ fromInventory: ItemInventoryResult; toInventory: ItemInventoryResult }> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  if (input.fromLocationId === input.toLocationId) {
    throw new Error("Source and destination locations must be different");
  }

  // Get source inventory
  const fromInventory = await getInventoryByItemAndLocation(
    tenantId,
    input.itemId,
    input.fromLocationId
  );

  if (!fromInventory || Number(fromInventory.availableQuantity) < Number(input.quantity)) {
    throw new Error("Insufficient stock at source location");
  }

  // Update source inventory (decrease)
  const fromQuantityBefore = Number(fromInventory.quantity);
  const fromQuantityAfter = fromQuantityBefore - Number(input.quantity);

  const updatedFrom = await prisma.itemInventory.update({
    where: {
      id: fromInventory.id,
    },
    data: {
      quantity: fromQuantityAfter,
      availableQuantity: fromQuantityAfter - Number(fromInventory.reservedQuantity),
    },
  });

  // Get or create destination inventory
  const toInventoryBefore = await getInventoryByItemAndLocation(
    tenantId,
    input.itemId,
    input.toLocationId
  );

  const toQuantityBefore = toInventoryBefore ? Number(toInventoryBefore.quantity) : 0;
  const toQuantityAfter = toQuantityBefore + Number(input.quantity);

  let updatedTo: ItemInventoryResult;
  if (!toInventoryBefore) {
    // Create destination inventory
    updatedTo = await createOrUpdateItemInventory(tenantId, {
      itemId: input.itemId,
      locationId: input.toLocationId,
      quantity: toQuantityAfter,
      reservedQuantity: 0,
    }, userId);
  } else {
    // Update destination inventory
    updatedTo = await prisma.itemInventory.update({
      where: {
        id: toInventoryBefore.id,
      },
      data: {
        quantity: toQuantityAfter,
        availableQuantity: toQuantityAfter - Number(toInventoryBefore.reservedQuantity),
      },
    });
  }

  // Log movements (outbound from source, inbound to destination)
  await createStockMovement(tenantId, {
    itemId: input.itemId,
    locationId: input.fromLocationId,
    movementType: "OUTBOUND",
    movementDate: new Date(),
    quantity: -Number(input.quantity),
    quantityBefore: fromQuantityBefore,
    quantityAfter: fromQuantityAfter,
    referenceType: "transfer",
    referenceId: updatedTo.id,
    reason: input.reason || `Transfer to ${input.toLocationId}`,
  }, userId);

  await createStockMovement(tenantId, {
    itemId: input.itemId,
    locationId: input.toLocationId,
    movementType: "INBOUND",
    movementDate: new Date(),
    quantity: Number(input.quantity),
    quantityBefore: toQuantityBefore,
    quantityAfter: toQuantityAfter,
    referenceType: "transfer",
    referenceId: updatedFrom.id,
    reason: input.reason || `Transfer from ${input.fromLocationId}`,
  }, userId);

  return {
    fromInventory: updatedFrom,
    toInventory: updatedTo,
  };
}

/**
 * Reserve stock (for orders)
 */
export async function reserveStock(
  tenantId: string,
  itemId: string,
  locationId: string,
  quantity: number
): Promise<ItemInventoryResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const inventory = await getInventoryByItemAndLocation(tenantId, itemId, locationId);

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  const currentReserved = Number(inventory.reservedQuantity);
  const newReserved = currentReserved + quantity;
  const available = Number(inventory.availableQuantity) - quantity;

  if (available < 0) {
    throw new Error("Insufficient available stock");
  }

  const updated = await prisma.itemInventory.update({
    where: {
      id: inventory.id,
    },
    data: {
      reservedQuantity: newReserved,
      availableQuantity: available,
    },
  });

  return updated;
}

/**
 * Release reserved stock
 */
export async function releaseReservedStock(
  tenantId: string,
  itemId: string,
  locationId: string,
  quantity: number
): Promise<ItemInventoryResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const inventory = await getInventoryByItemAndLocation(tenantId, itemId, locationId);

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  const currentReserved = Number(inventory.reservedQuantity);
  const newReserved = Math.max(0, currentReserved - quantity);
  const available = Number(inventory.availableQuantity) + quantity;

  const updated = await prisma.itemInventory.update({
    where: {
      id: inventory.id,
    },
    data: {
      reservedQuantity: newReserved,
      availableQuantity: available,
    },
  });

  return updated;
}

