"use strict";
/**
 * Verify Setup - Check if everything is configured correctly
 */
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function verifySetup() {
    console.log("\n🔍 Verifying Setup...\n");
    try {
        // Test 1: Check connection
        console.log("1. Testing database connection...");
        await prisma.$connect();
        console.log("   ✅ Connected successfully!\n");
        // Test 2: Check if we can query (this will fail if RLS blocks everything)
        console.log("2. Testing basic query...");
        const tenantCount = await prisma.$queryRaw `
      SELECT COUNT(*) as count FROM "Tenant"
    `;
        console.log(`   ✅ Can query database (found ${tenantCount[0].count} tenants)\n`);
        // Test 3: Check RLS function exists
        console.log("3. Checking RLS function...");
        const functions = await prisma.$queryRaw `
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'get_current_tenant_id'
    `;
        if (functions.length > 0) {
            console.log("   ✅ RLS function exists\n");
        }
        else {
            console.log("   ⚠️  RLS function not found (run migrations?)\n");
        }
        // Test 4: Try to set tenant context
        console.log("4. Testing tenant context setting...");
        try {
            await prisma.$executeRawUnsafe(`SET app.current_tenant_id = 'test-tenant-id'`);
            console.log("   ✅ Can set tenant context\n");
        }
        catch (error) {
            console.log(`   ⚠️  Could not set tenant context: ${error.message}\n`);
        }
        console.log("✅ Setup verification complete!\n");
        console.log("Next step: Run 'npm run test:tenant-isolation' to test RLS\n");
    }
    catch (error) {
        console.error("\n❌ Setup verification failed:");
        console.error(`   Error: ${error.message}\n`);
        if (error.message.includes("authentication")) {
            console.log("💡 Tip: Make sure DATABASE_URL in .env uses app_user role");
            console.log("   And that you've run the create_database_roles.sql script\n");
        }
    }
    finally {
        await prisma.$disconnect();
    }
}
verifySetup();
//# sourceMappingURL=verify-setup.js.map