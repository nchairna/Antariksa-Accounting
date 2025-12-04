/**
 * Quick script to check if database roles exist
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    // Try to query roles (this requires admin access, so use postgres connection)
    const result = await prisma.$queryRaw<Array<{ rolname: string }>>`
      SELECT rolname 
      FROM pg_roles 
      WHERE rolname LIKE 'app_%'
    `;

    console.log("\n📋 Database Roles Status:\n");
    
    if (result.length === 0) {
      console.log("❌ No app_* roles found!");
      console.log("\n⚠️  You need to run the database roles script first.");
      console.log("   See: backend/prisma/scripts/README_RUN_ROLES_SCRIPT.md\n");
    } else {
      console.log("✅ Found roles:");
      result.forEach((role) => {
        console.log(`   - ${role.rolname}`);
      });
      console.log("\n✅ Roles are set up correctly!\n");
    }
  } catch (error: any) {
    console.error("\n❌ Error checking roles:", error.message);
    console.log("\n💡 Try connecting as postgres user to check roles.\n");
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();



