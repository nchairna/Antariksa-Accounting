/**
 * Tenant Isolation Test Script
 * 
 * This script tests that Row-Level Security (RLS) is working correctly.
 * It verifies that tenants cannot access each other's data.
 * 
 * Run with: npx ts-node src/scripts/test-tenant-isolation.ts
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

/**
 * Test 1: Create two tenants
 */
async function testCreateTenants(): Promise<void> {
  try {
    // Note: We need to connect as admin to create tenants
    // For this test, we'll use the postgres connection
    console.log("Creating test tenants...");

    // Create Tenant A
    const tenantA = await prisma.tenant.create({
      data: {
        code: "TEST_TENANT_A",
        name: "Test Tenant A",
        status: "ACTIVE",
        subscriptionTier: "STANDARD",
      },
    });

    // Create Tenant B
    const tenantB = await prisma.tenant.create({
      data: {
        code: "TEST_TENANT_B",
        name: "Test Tenant B",
        status: "ACTIVE",
        subscriptionTier: "STANDARD",
      },
    });

    results.push({
      test: "Create Tenants",
      passed: true,
      message: `Created Tenant A (${tenantA.id}) and Tenant B (${tenantB.id})`,
    });

    // Store tenant IDs for later tests
    (global as any).testTenantA = tenantA.id;
    (global as any).testTenantB = tenantB.id;
  } catch (error: any) {
    results.push({
      test: "Create Tenants",
      passed: false,
      message: `Failed: ${error.message}`,
    });
  }
}

/**
 * Test 2: Set tenant context and verify RLS filtering
 */
async function testRLSFiltering(): Promise<void> {
  try {
    const tenantA = (global as any).testTenantA;
    const tenantB = (global as any).testTenantB;

    if (!tenantA || !tenantB) {
      results.push({
        test: "RLS Filtering",
        passed: false,
        message: "Tenants not created in previous test",
      });
      return;
    }

    // Set tenant context to Tenant A
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantA}'`);

    // Try to query users - should only see Tenant A's users (none yet)
    const usersAsTenantA = await prisma.user.findMany();
    
    // Set tenant context to Tenant B
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantB}'`);

    // Try to query users - should only see Tenant B's users (none yet)
    const usersAsTenantB = await prisma.user.findMany();

    // Verify both queries returned empty (no users created yet)
    const passed = usersAsTenantA.length === 0 && usersAsTenantB.length === 0;

    results.push({
      test: "RLS Filtering",
      passed,
      message: passed
        ? "RLS is filtering correctly - each tenant sees only their data"
        : "RLS may not be working - tenants can see each other's data",
    });
  } catch (error: any) {
    results.push({
      test: "RLS Filtering",
      passed: false,
      message: `Failed: ${error.message}`,
    });
  }
}

/**
 * Test 3: Verify tenant isolation with data
 */
async function testTenantIsolation(): Promise<void> {
  try {
    const tenantA = (global as any).testTenantA;
    const tenantB = (global as any).testTenantB;

    if (!tenantA || !tenantB) {
      results.push({
        test: "Tenant Isolation",
        passed: false,
        message: "Tenants not created",
      });
      return;
    }

    // Create a role for Tenant A
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantA}'`);
    const roleA = await prisma.role.create({
      data: {
        tenantId: tenantA,
        name: "Admin",
        description: "Admin role for Tenant A",
        isSystemRole: false,
      },
    });

    // Create a role for Tenant B
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantB}'`);
    const roleB = await prisma.role.create({
      data: {
        tenantId: tenantB,
        name: "Admin",
        description: "Admin role for Tenant B",
        isSystemRole: false,
      },
    });

    // Now test: Query as Tenant A - should only see Tenant A's role
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantA}'`);
    const rolesAsTenantA = await prisma.role.findMany();
    const canSeeTenantARole = rolesAsTenantA.some((r) => r.id === roleA.id);
    const cannotSeeTenantBRole = !rolesAsTenantA.some((r) => r.id === roleB.id);

    // Query as Tenant B - should only see Tenant B's role
    await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantB}'`);
    const rolesAsTenantB = await prisma.role.findMany();
    const canSeeTenantBRole = rolesAsTenantB.some((r) => r.id === roleB.id);
    const cannotSeeTenantARole = !rolesAsTenantB.some((r) => r.id === roleA.id);

    const passed =
      canSeeTenantARole &&
      cannotSeeTenantBRole &&
      canSeeTenantBRole &&
      cannotSeeTenantARole;

    results.push({
      test: "Tenant Isolation",
      passed,
      message: passed
        ? "✅ Perfect! Tenants are completely isolated"
        : "❌ FAILED! Tenants can see each other's data - RLS not working",
    });
  } catch (error: any) {
    results.push({
      test: "Tenant Isolation",
      passed: false,
      message: `Failed: ${error.message}`,
    });
  }
}

/**
 * Cleanup: Delete test data
 */
async function cleanup(): Promise<void> {
  try {
    const tenantA = (global as any).testTenantA;
    const tenantB = (global as any).testTenantB;

    if (tenantA) {
      await prisma.tenant.delete({ where: { id: tenantA } }).catch(() => {});
    }
    if (tenantB) {
      await prisma.tenant.delete({ where: { id: tenantB } }).catch(() => {});
    }

    console.log("Test data cleaned up");
  } catch (error) {
    console.error("Error cleaning up:", error);
  }
}

/**
 * Run all tests
 */
async function runTests(): Promise<void> {
  console.log("🧪 Starting Tenant Isolation Tests...\n");

  await testCreateTenants();
  await testRLSFiltering();
  await testTenantIsolation();

  // Print results
  console.log("\n📊 Test Results:\n");
  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.test}: ${result.message}`);
  });

  const allPassed = results.every((r) => r.passed);
  console.log(`\n${allPassed ? "✅ All tests passed!" : "❌ Some tests failed!"}\n`);

  // Cleanup
  await cleanup();

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

