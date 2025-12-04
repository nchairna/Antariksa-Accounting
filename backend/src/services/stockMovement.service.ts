/**
 * Stock Movement Service
 * 
 * Business logic for stock movement operations
 */

import { PrismaClient } from "../generated/prisma";
import { StockMovementQueryParams } from "../validators/stockMovement.validator";

const prisma = new PrismaClient();

export interface StockMovementResult {
  id: string;
  tenantId: string;
  itemId: string;
  locationId: string;
  movementType: string;
  movementDate: Date;
  quantity: any; // Decimal
  quantityBefore: any; // Decimal
  quantityAfter: any; // Decimal
  referenceType: string | null;
  referenceId: string | null;
  costPerUnit: any | null; // Decimal
  totalCost: any | null; // Decimal
  reason: string | null;
  createdById: string | null;
  createdAt: Date;
  item?: any;
  location?: any;
  createdBy?: any;
}

export interface CreateStockMovementInput {
  itemId: string;
  locationId: string;
  movementType: "INBOUND" | "OUTBOUND" | "ADJUSTMENT" | "TRANSFER" | "DAMAGE";
  movementDate: Date;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  costPerUnit?: number | null;
  totalCost?: number | null;
  reason?: string | null;
}

/**
 * Create a stock movement record
 */
export async function createStockMovement(
  tenantId: string,
  input: CreateStockMovementInput,
  userId?: string
): Promise<StockMovementResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const movement = await prisma.stockMovement.create({
    data: {
      tenantId,
      itemId: input.itemId,
      locationId: input.locationId,
      movementType: input.movementType,
      movementDate: input.movementDate,
      quantity: input.quantity,
      quantityBefore: input.quantityBefore,
      quantityAfter: input.quantityAfter,
      referenceType: input.referenceType || null,
      referenceId: input.referenceId || null,
      costPerUnit: input.costPerUnit || null,
      totalCost: input.totalCost || null,
      reason: input.reason || null,
      createdById: userId || null,
    },
  });

  return movement;
}

/**
 * Get all stock movements with filtering
 */
export async function getStockMovements(
  tenantId: string,
  query: StockMovementQueryParams
): Promise<{ movements: StockMovementResult[]; count: number }> {
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

  if (query.movementType) {
    where.movementType = query.movementType;
  }

  if (query.referenceType) {
    where.referenceType = query.referenceType;
  }

  if (query.referenceId) {
    where.referenceId = query.referenceId;
  }

  if (query.startDate || query.endDate) {
    where.movementDate = {};
    if (query.startDate) {
      where.movementDate.gte = query.startDate;
    }
    if (query.endDate) {
      where.movementDate.lte = query.endDate;
    }
  }

  const skip = (query.page - 1) * query.limit;

  const [movements, count] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        item: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: {
        movementDate: "desc",
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { movements, count };
}

/**
 * Get stock movement by ID
 */
export async function getStockMovementById(
  tenantId: string,
  movementId: string
): Promise<StockMovementResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const movement = await prisma.stockMovement.findFirst({
    where: {
      id: movementId,
      tenantId,
    },
    include: {
      item: true,
      location: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  return movement;
}

/**
 * Get movements by item
 */
export async function getMovementsByItem(
  tenantId: string,
  itemId: string,
  limit: number = 50
): Promise<StockMovementResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantId,
      itemId,
    },
    take: limit,
    orderBy: {
      movementDate: "desc",
    },
    include: {
      location: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return movements;
}

/**
 * Get movements by location
 */
export async function getMovementsByLocation(
  tenantId: string,
  locationId: string,
  limit: number = 50
): Promise<StockMovementResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantId,
      locationId,
    },
    take: limit,
    orderBy: {
      movementDate: "desc",
    },
    include: {
      item: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return movements;
}



