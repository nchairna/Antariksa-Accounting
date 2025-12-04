/**
 * Tenant Service
 * 
 * Business logic for tenant operations
 */

import { PrismaClient } from "../generated/prisma";
import { UpdateTenantInput, CreateTenantSettingInput, UpdateTenantSettingInput } from "../validators/tenant.validator";

const prisma = new PrismaClient();

export interface TenantResult {
  id: string;
  code: string;
  name: string;
  domain: string | null;
  status: string;
  subscriptionTier: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TenantSettingResult {
  id: string;
  tenantId: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get tenant by ID
 */
export async function getTenantById(
  tenantId: string
): Promise<TenantResult | null> {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      deletedAt: null,
    },
  });

  return tenant as any;
}

/**
 * Update tenant
 */
export async function updateTenant(
  tenantId: string,
  input: UpdateTenantInput
): Promise<TenantResult> {
  const existingTenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      deletedAt: null,
    },
  });

  if (!existingTenant) {
    throw new Error("Tenant not found");
  }

  // Check domain conflict
  if (input.domain !== undefined && input.domain !== existingTenant.domain) {
    if (input.domain) {
      const domainConflict = await prisma.tenant.findUnique({
        where: {
          domain: input.domain,
        },
      });

      if (domainConflict && domainConflict.id !== tenantId) {
        throw new Error("Domain already exists");
      }
    }
  }

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.domain !== undefined) updateData.domain = input.domain;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.subscriptionTier !== undefined) updateData.subscriptionTier = input.subscriptionTier;

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: updateData,
  });

  return updatedTenant as any;
}

/**
 * Get all tenant settings
 */
export async function getTenantSettings(
  tenantId: string
): Promise<TenantSettingResult[]> {
  const settings = await prisma.tenantSetting.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      key: "asc",
    },
  });

  return settings as any;
}

/**
 * Get tenant setting by key
 */
export async function getTenantSettingByKey(
  tenantId: string,
  key: string
): Promise<TenantSettingResult | null> {
  const setting = await prisma.tenantSetting.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key,
      },
    },
  });

  return setting as any;
}

/**
 * Create tenant setting
 */
export async function createTenantSetting(
  tenantId: string,
  input: CreateTenantSettingInput
): Promise<TenantSettingResult> {
  // Check if setting already exists
  const existingSetting = await prisma.tenantSetting.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: input.key,
      },
    },
  });

  if (existingSetting) {
    throw new Error("Setting key already exists for this tenant");
  }

  const setting = await prisma.tenantSetting.create({
    data: {
      tenantId,
      key: input.key,
      value: input.value,
    },
  });

  return setting as any;
}

/**
 * Update tenant setting
 */
export async function updateTenantSetting(
  tenantId: string,
  key: string,
  input: UpdateTenantSettingInput
): Promise<TenantSettingResult> {
  const existingSetting = await prisma.tenantSetting.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key,
      },
    },
  });

  if (!existingSetting) {
    throw new Error("Setting not found");
  }

  const updatedSetting = await prisma.tenantSetting.update({
    where: {
      tenantId_key: {
        tenantId,
        key,
      },
    },
    data: {
      value: input.value,
    },
  });

  return updatedSetting as any;
}

/**
 * Delete tenant setting
 */
export async function deleteTenantSetting(
  tenantId: string,
  key: string
): Promise<void> {
  const setting = await prisma.tenantSetting.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key,
      },
    },
  });

  if (!setting) {
    throw new Error("Setting not found");
  }

  await prisma.tenantSetting.delete({
    where: {
      tenantId_key: {
        tenantId,
        key,
      },
    },
  });
}



