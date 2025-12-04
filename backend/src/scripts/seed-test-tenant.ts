/**
 * Seed Test Tenant Script
 * 
 * Creates a test tenant for development/testing purposes
 * Run with: npm run seed:tenant
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function seedTestTenant() {
  try {
    console.log("🌱 Seeding test tenant...");

    // Check if test tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: {
        code: "TEST_TENANT",
      },
    });

    if (existingTenant) {
      console.log("✅ Test tenant already exists!");
      console.log(`   Tenant ID: ${existingTenant.id}`);
      console.log(`   Code: ${existingTenant.code}`);
      console.log(`   Name: ${existingTenant.name}`);
      console.log("\n💡 You can use this tenant ID for testing:");
      console.log(`   ${existingTenant.id}`);
      return;
    }

    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        code: "TEST_TENANT",
        name: "Test Tenant",
        status: "ACTIVE",
        subscriptionTier: "STANDARD",
      },
    });

    console.log("✅ Test tenant created successfully!");
    console.log("\n📋 Tenant Details:");
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Code: ${tenant.code}`);
    console.log(`   Name: ${tenant.name}`);
    console.log(`   Status: ${tenant.status}`);
    console.log(`   Subscription: ${tenant.subscriptionTier}`);
    console.log("\n💡 Use this tenant ID for testing:");
    console.log(`   ${tenant.id}`);
    console.log("\n📝 Add this to your .env or use in API requests:");
    console.log(`   x-tenant-id: ${tenant.id}`);
  } catch (error: any) {
    console.error("❌ Error seeding test tenant:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTestTenant();



