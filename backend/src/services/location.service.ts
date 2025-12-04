/**
 * Location Service
 * 
 * Business logic for inventory location operations
 */

import { PrismaClient } from "../generated/prisma";
import { CreateLocationInput, UpdateLocationInput, LocationQueryParams } from "../validators/location.validator";

const prisma = new PrismaClient();

export interface LocationResult {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address: string | null;
  isDefault: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new inventory location
 */
export async function createLocation(
  tenantId: string,
  input: CreateLocationInput
): Promise<LocationResult> {
  // Set tenant context for RLS
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if location code already exists
  const existing = await prisma.inventoryLocation.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code: input.code,
      },
    },
  });

  if (existing) {
    throw new Error(`Location with code "${input.code}" already exists`);
  }

  // If setting as default, unset other default locations
  if (input.isDefault) {
    await prisma.inventoryLocation.updateMany({
      where: {
        tenantId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const location = await prisma.inventoryLocation.create({
    data: {
      tenantId,
      code: input.code,
      name: input.name,
      address: input.address || null,
      isDefault: input.isDefault || false,
      status: input.status || "ACTIVE",
    },
  });

  return location;
}

/**
 * Get all locations with filtering and pagination
 */
export async function getLocations(
  tenantId: string,
  query: LocationQueryParams
): Promise<{ locations: LocationResult[]; count: number }> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { code: { contains: query.search, mode: "insensitive" } },
      { name: { contains: query.search, mode: "insensitive" } },
      { address: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [locations, count] = await Promise.all([
    prisma.inventoryLocation.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: [
        { isDefault: "desc" },
        { name: "asc" },
      ],
    }),
    prisma.inventoryLocation.count({ where }),
  ]);

  return { locations, count };
}

/**
 * Get location by ID
 */
export async function getLocationById(
  tenantId: string,
  locationId: string
): Promise<LocationResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const location = await prisma.inventoryLocation.findUnique({
    where: {
      id: locationId,
      tenantId,
    },
  });

  return location;
}

/**
 * Update location
 */
export async function updateLocation(
  tenantId: string,
  locationId: string,
  input: UpdateLocationInput
): Promise<LocationResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if location exists
  const existing = await prisma.inventoryLocation.findUnique({
    where: {
      id: locationId,
      tenantId,
    },
  });

  if (!existing) {
    throw new Error("Location not found");
  }

  // If updating code, check if new code already exists
  if (input.code && input.code !== existing.code) {
    const codeExists = await prisma.inventoryLocation.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: input.code,
        },
      },
    });

    if (codeExists) {
      throw new Error(`Location with code "${input.code}" already exists`);
    }
  }

  // If setting as default, unset other default locations
  if (input.isDefault === true) {
    await prisma.inventoryLocation.updateMany({
      where: {
        tenantId,
        isDefault: true,
        id: { not: locationId },
      },
      data: {
        isDefault: false,
      },
    });
  }

  const location = await prisma.inventoryLocation.update({
    where: {
      id: locationId,
    },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      ...(input.status && { status: input.status }),
    },
  });

  return location;
}

/**
 * Delete location
 */
export async function deleteLocation(
  tenantId: string,
  locationId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if location exists
  const existing = await prisma.inventoryLocation.findUnique({
    where: {
      id: locationId,
      tenantId,
    },
    include: {
      inventories: {
        take: 1,
      },
    },
  });

  if (!existing) {
    throw new Error("Location not found");
  }

  // Check if location has inventory
  if (existing.inventories.length > 0) {
    throw new Error("Cannot delete location with existing inventory. Please transfer or remove inventory first.");
  }

  await prisma.inventoryLocation.delete({
    where: {
      id: locationId,
    },
  });
}

/**
 * Get default location for tenant
 */
export async function getDefaultLocation(
  tenantId: string
): Promise<LocationResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const location = await prisma.inventoryLocation.findFirst({
    where: {
      tenantId,
      isDefault: true,
      status: "ACTIVE",
    },
  });

  return location;
}



