/**
 * Supplier Service
 * 
 * Business logic for supplier operations
 */

import { PrismaClient } from "../generated/prisma";
import { CreateSupplierInput, UpdateSupplierInput, CreateSupplierAddressInput, UpdateSupplierAddressInput } from "../validators/supplier.validator";

const prisma = new PrismaClient();

export interface SupplierResult {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  supplierType: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  paymentTerms: string | null;
  currency: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankRoutingNumber: string | null;
  swiftCode: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  addresses?: any[];
}

export interface SupplierAddressResult {
  id: string;
  supplierId: string;
  tenantId: string;
  addressType: string;
  streetAddress: string;
  city: string;
  stateProvince: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new supplier
 */
export async function createSupplier(
  tenantId: string,
  input: CreateSupplierInput
): Promise<SupplierResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if supplier code already exists
  const existingSupplier = await prisma.supplier.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code: input.code.toUpperCase(),
      },
    },
  });

  if (existingSupplier) {
    throw new Error("Supplier code already exists in this tenant");
  }

  const supplier = await prisma.supplier.create({
    data: {
      tenantId,
      code: input.code.toUpperCase(),
      name: input.name,
      supplierType: input.supplierType || "DISTRIBUTOR",
      email: input.email || null,
      phone: input.phone || null,
      taxId: input.taxId || null,
      paymentTerms: input.paymentTerms || null,
      currency: input.currency || "USD",
      bankName: input.bankName || null,
      bankAccountNumber: input.bankAccountNumber || null,
      bankRoutingNumber: input.bankRoutingNumber || null,
      swiftCode: input.swiftCode || null,
      status: input.status || "ACTIVE",
    },
  });

  return supplier as any;
}

/**
 * Get all suppliers for a tenant
 */
export async function getSuppliers(
  tenantId: string,
  filters?: {
    supplierType?: string;
    status?: string;
    search?: string;
  }
): Promise<SupplierResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (filters?.supplierType) {
    where.supplierType = filters.supplierType;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      addresses: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return suppliers as any;
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(
  supplierId: string,
  tenantId: string
): Promise<SupplierResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      tenantId,
      deletedAt: null,
    },
    include: {
      addresses: {
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "asc" },
        ],
      },
    },
  });

  return supplier as any;
}

/**
 * Update supplier
 */
export async function updateSupplier(
  supplierId: string,
  tenantId: string,
  input: UpdateSupplierInput
): Promise<SupplierResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingSupplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existingSupplier) {
    throw new Error("Supplier not found or does not belong to this tenant");
  }

  // Check code conflict
  if (input.code && input.code.toUpperCase() !== existingSupplier.code) {
    const codeConflict = await prisma.supplier.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: input.code.toUpperCase(),
        },
      },
    });

    if (codeConflict) {
      throw new Error("Supplier code already exists in this tenant");
    }
  }

  const updateData: any = {};
  if (input.code !== undefined) updateData.code = input.code.toUpperCase();
  if (input.name !== undefined) updateData.name = input.name;
  if (input.supplierType !== undefined) updateData.supplierType = input.supplierType;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.taxId !== undefined) updateData.taxId = input.taxId;
  if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.bankName !== undefined) updateData.bankName = input.bankName;
  if (input.bankAccountNumber !== undefined) updateData.bankAccountNumber = input.bankAccountNumber;
  if (input.bankRoutingNumber !== undefined) updateData.bankRoutingNumber = input.bankRoutingNumber;
  if (input.swiftCode !== undefined) updateData.swiftCode = input.swiftCode;
  if (input.status !== undefined) updateData.status = input.status;

  const updatedSupplier = await prisma.supplier.update({
    where: { id: supplierId },
    data: updateData,
    include: {
      addresses: true,
    },
  });

  return updatedSupplier as any;
}

/**
 * Delete supplier (soft delete)
 */
export async function deleteSupplier(
  supplierId: string,
  tenantId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!supplier) {
    throw new Error("Supplier not found or does not belong to this tenant");
  }

  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Create supplier address
 */
export async function createSupplierAddress(
  supplierId: string,
  tenantId: string,
  input: CreateSupplierAddressInput
): Promise<SupplierAddressResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Verify supplier exists and belongs to tenant
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!supplier) {
    throw new Error("Supplier not found or does not belong to this tenant");
  }

  // If this is set as default, unset other defaults of the same type
  if (input.isDefault) {
    await prisma.supplierAddress.updateMany({
      where: {
        supplierId,
        tenantId,
        addressType: input.addressType,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const address = await prisma.supplierAddress.create({
    data: {
      supplierId,
      tenantId,
      addressType: input.addressType,
      streetAddress: input.streetAddress,
      city: input.city,
      stateProvince: input.stateProvince || null,
      postalCode: input.postalCode || null,
      country: input.country,
      isDefault: input.isDefault || false,
    },
  });

  return address as any;
}

/**
 * Get supplier addresses
 */
export async function getSupplierAddresses(
  supplierId: string,
  tenantId: string
): Promise<SupplierAddressResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const addresses = await prisma.supplierAddress.findMany({
    where: {
      supplierId,
      tenantId,
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "asc" },
    ],
  });

  return addresses as any;
}

/**
 * Update supplier address
 */
export async function updateSupplierAddress(
  addressId: string,
  supplierId: string,
  tenantId: string,
  input: UpdateSupplierAddressInput
): Promise<SupplierAddressResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingAddress = await prisma.supplierAddress.findFirst({
    where: {
      id: addressId,
      supplierId,
      tenantId,
    },
  });

  if (!existingAddress) {
    throw new Error("Address not found or does not belong to this supplier");
  }

  // If setting as default, unset other defaults of the same type
  if (input.isDefault === true) {
    await prisma.supplierAddress.updateMany({
      where: {
        supplierId,
        tenantId,
        addressType: input.addressType || existingAddress.addressType,
        isDefault: true,
        id: { not: addressId },
      },
      data: {
        isDefault: false,
      },
    });
  }

  const updateData: any = {};
  if (input.addressType !== undefined) updateData.addressType = input.addressType;
  if (input.streetAddress !== undefined) updateData.streetAddress = input.streetAddress;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.stateProvince !== undefined) updateData.stateProvince = input.stateProvince;
  if (input.postalCode !== undefined) updateData.postalCode = input.postalCode;
  if (input.country !== undefined) updateData.country = input.country;
  if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;

  const updatedAddress = await prisma.supplierAddress.update({
    where: { id: addressId },
    data: updateData,
  });

  return updatedAddress as any;
}

/**
 * Delete supplier address
 */
export async function deleteSupplierAddress(
  addressId: string,
  supplierId: string,
  tenantId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const address = await prisma.supplierAddress.findFirst({
    where: {
      id: addressId,
      supplierId,
      tenantId,
    },
  });

  if (!address) {
    throw new Error("Address not found or does not belong to this supplier");
  }

  await prisma.supplierAddress.delete({
    where: { id: addressId },
  });
}



