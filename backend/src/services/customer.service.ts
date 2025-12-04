/**
 * Customer Service
 * 
 * Business logic for customer operations
 */

import { PrismaClient } from "../generated/prisma";
import { CreateCustomerInput, UpdateCustomerInput, CreateCustomerAddressInput, UpdateCustomerAddressInput } from "../validators/customer.validator";

const prisma = new PrismaClient();

export interface CustomerResult {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  customerType: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  creditLimit: any | null;
  paymentTerms: string | null;
  currency: string;
  defaultDiscount: any | null;
  priceListId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  addresses?: any[];
}

export interface CustomerAddressResult {
  id: string;
  customerId: string;
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
 * Create a new customer
 */
export async function createCustomer(
  tenantId: string,
  input: CreateCustomerInput
): Promise<CustomerResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Check if customer code already exists
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code: input.code.toUpperCase(),
      },
    },
  });

  if (existingCustomer) {
    throw new Error("Customer code already exists in this tenant");
  }

  // Check if email already exists (if provided)
  if (input.email) {
    const existingEmail = await prisma.customer.findFirst({
      where: {
        tenantId,
        email: input.email,
      },
    });

    if (existingEmail) {
      throw new Error("Email already exists in this tenant");
    }
  }

  const customer = await prisma.customer.create({
    data: {
      tenantId,
      code: input.code.toUpperCase(),
      name: input.name,
      customerType: input.customerType || "COMPANY",
      email: input.email || null,
      phone: input.phone || null,
      taxId: input.taxId || null,
      creditLimit: input.creditLimit || null,
      paymentTerms: input.paymentTerms || null,
      currency: input.currency || "USD",
      defaultDiscount: input.defaultDiscount || null,
      priceListId: input.priceListId || null,
      status: input.status || "ACTIVE",
    },
  });

  return customer as any;
}

/**
 * Get all customers for a tenant
 */
export async function getCustomers(
  tenantId: string,
  filters?: {
    customerType?: string;
    status?: string;
    search?: string;
  }
): Promise<CustomerResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (filters?.customerType) {
    where.customerType = filters.customerType;
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

  const customers = await prisma.customer.findMany({
    where,
    include: {
      addresses: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return customers as any;
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  customerId: string,
  tenantId: string
): Promise<CustomerResult | null> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
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

  return customer as any;
}

/**
 * Update customer
 */
export async function updateCustomer(
  customerId: string,
  tenantId: string,
  input: UpdateCustomerInput
): Promise<CustomerResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!existingCustomer) {
    throw new Error("Customer not found or does not belong to this tenant");
  }

  // Check code conflict
  if (input.code && input.code.toUpperCase() !== existingCustomer.code) {
    const codeConflict = await prisma.customer.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: input.code.toUpperCase(),
        },
      },
    });

    if (codeConflict) {
      throw new Error("Customer code already exists in this tenant");
    }
  }

  // Check email conflict
  if (input.email !== undefined && input.email !== existingCustomer.email) {
    if (input.email) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          tenantId,
          email: input.email,
          id: { not: customerId },
        },
      });

      if (emailConflict) {
        throw new Error("Email already exists in this tenant");
      }
    }
  }

  const updateData: any = {};
  if (input.code !== undefined) updateData.code = input.code.toUpperCase();
  if (input.name !== undefined) updateData.name = input.name;
  if (input.customerType !== undefined) updateData.customerType = input.customerType;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.taxId !== undefined) updateData.taxId = input.taxId;
  if (input.creditLimit !== undefined) updateData.creditLimit = input.creditLimit;
  if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.defaultDiscount !== undefined) updateData.defaultDiscount = input.defaultDiscount;
  if (input.priceListId !== undefined) updateData.priceListId = input.priceListId;
  if (input.status !== undefined) updateData.status = input.status;

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
    include: {
      addresses: true,
    },
  });

  return updatedCustomer as any;
}

/**
 * Delete customer (soft delete)
 */
export async function deleteCustomer(
  customerId: string,
  tenantId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found or does not belong to this tenant");
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Create customer address
 */
export async function createCustomerAddress(
  customerId: string,
  tenantId: string,
  input: CreateCustomerAddressInput
): Promise<CustomerAddressResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Verify customer exists and belongs to tenant
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      tenantId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found or does not belong to this tenant");
  }

  // If this is set as default, unset other defaults of the same type
  if (input.isDefault) {
    await prisma.customerAddress.updateMany({
      where: {
        customerId,
        tenantId,
        addressType: input.addressType,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const address = await prisma.customerAddress.create({
    data: {
      customerId,
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
 * Get customer addresses
 */
export async function getCustomerAddresses(
  customerId: string,
  tenantId: string
): Promise<CustomerAddressResult[]> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const addresses = await prisma.customerAddress.findMany({
    where: {
      customerId,
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
 * Update customer address
 */
export async function updateCustomerAddress(
  addressId: string,
  customerId: string,
  tenantId: string,
  input: UpdateCustomerAddressInput
): Promise<CustomerAddressResult> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const existingAddress = await prisma.customerAddress.findFirst({
    where: {
      id: addressId,
      customerId,
      tenantId,
    },
  });

  if (!existingAddress) {
    throw new Error("Address not found or does not belong to this customer");
  }

  // If setting as default, unset other defaults of the same type
  if (input.isDefault === true) {
    await prisma.customerAddress.updateMany({
      where: {
        customerId,
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

  const updatedAddress = await prisma.customerAddress.update({
    where: { id: addressId },
    data: updateData,
  });

  return updatedAddress as any;
}

/**
 * Delete customer address
 */
export async function deleteCustomerAddress(
  addressId: string,
  customerId: string,
  tenantId: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  const address = await prisma.customerAddress.findFirst({
    where: {
      id: addressId,
      customerId,
      tenantId,
    },
  });

  if (!address) {
    throw new Error("Address not found or does not belong to this customer");
  }

  await prisma.customerAddress.delete({
    where: { id: addressId },
  });
}



