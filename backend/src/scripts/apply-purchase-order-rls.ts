/**
 * Apply RLS Policies for Purchase Order Tables
 *
 * This script applies Row-Level Security policies to the purchase order tables
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function applyPurchaseOrderRLSPolicies() {
  console.log("🔒 Applying RLS policies for PurchaseOrder tables...\n");

  try {
    // Enable RLS on PurchaseOrder
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PurchaseOrder" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on PurchaseOrder");

    // Create RLS policy for PurchaseOrder
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_purchase_order ON "PurchaseOrder"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_purchase_order ON "PurchaseOrder"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for PurchaseOrder");

    // Enable RLS on PurchaseOrderLine
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PurchaseOrderLine" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on PurchaseOrderLine");

    // Create RLS policy for PurchaseOrderLine
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_purchase_order_line ON "PurchaseOrderLine"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_purchase_order_line ON "PurchaseOrderLine"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for PurchaseOrderLine");

    console.log("\n✅ Purchase order RLS policies applied successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("⚠️  Policies may already exist, continuing...");
    } else {
      console.error("❌ Error applying purchase order RLS policies:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyPurchaseOrderRLSPolicies()
  .then(() => {
    console.log("\n🎉 Purchase order RLS setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to apply purchase order RLS policies:", error);
    process.exit(1);
  });




