/**
 * Clear Test Data Script
 * 
 * WARNING: This will delete all test data from the database!
 * Only use this if you want a completely fresh start.
 * 
 * Run with: npm run clear:test-data
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function clearTestData() {
  try {
    console.log("⚠️  WARNING: This will delete all test data!");
    console.log("   - All UserSessions");
    console.log(" - All Users");
    console.log("   - All Tenants");
    console.log("   - All Roles");
    console.log("   - All TenantSettings\n");

    // Delete in order (respecting foreign key constraints)
    console.log("🗑️  Deleting UserSessions...");
    const deletedSessions = await prisma.userSession.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSessions.count} sessions`);

    console.log("🗑️  Deleting Users...");
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);

    console.log("🗑️  Deleting Roles...");
    const deletedRoles = await prisma.role.deleteMany({});
    console.log(`   ✅ Deleted ${deletedRoles.count} roles`);

    console.log("🗑️  Deleting TenantSettings...");
    const deletedSettings = await prisma.tenantSetting.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSettings.count} settings`);

    console.log("🗑️  Deleting Tenants...");
    const deletedTenants = await prisma.tenant.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTenants.count} tenants`);

    console.log("\n✅ All test data cleared!");
    console.log("💡 Run 'npm run seed:tenant' to create a new test tenant");
  } catch (error: any) {
    console.error("❌ Error clearing test data:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the clear function
clearTestData();



