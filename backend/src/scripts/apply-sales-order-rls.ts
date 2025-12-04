/**
 * Apply RLS Policies for Sales Order Tables
 *
 * This script applies Row-Level Security policies to the sales order tables
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function applySalesOrderRLSPolicies() {
  console.log("🔒 Applying RLS policies for SalesOrder tables...\n");

  try {
    // Enable RLS on SalesOrder
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SalesOrder" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on SalesOrder");

    // Create RLS policy for SalesOrder
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_sales_order ON "SalesOrder"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_sales_order ON "SalesOrder"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for SalesOrder");

    // Enable RLS on SalesOrderLine
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SalesOrderLine" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on SalesOrderLine");

    // Create RLS policy for SalesOrderLine
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_sales_order_line ON "SalesOrderLine"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_sales_order_line ON "SalesOrderLine"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for SalesOrderLine");

    console.log("\n✅ Sales order RLS policies applied successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("⚠️  Policies may already exist, continuing...");
    } else {
      console.error("❌ Error applying sales order RLS policies:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applySalesOrderRLSPolicies()
  .then(() => {
    console.log("\n🎉 Sales order RLS setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to apply sales order RLS policies:", error);
    process.exit(1);
  });



