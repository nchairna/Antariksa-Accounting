/**
 * Apply RLS Policies for Inventory Tables
 * 
 * This script applies Row-Level Security policies to the inventory tables
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function applyRLSPolicies() {
  console.log("🔒 Applying RLS policies for inventory tables...\n");

  try {
    // Enable RLS on InventoryLocation
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "InventoryLocation" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on InventoryLocation");

    // Create RLS policy for InventoryLocation
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_inventory_location ON "InventoryLocation"`);
    } catch (e) {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_inventory_location ON "InventoryLocation"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for InventoryLocation");

    // Enable RLS on ItemInventory
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ItemInventory" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on ItemInventory");

    // Create RLS policy for ItemInventory
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_item_inventory ON "ItemInventory"`);
    } catch (e) {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_item_inventory ON "ItemInventory"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for ItemInventory");

    // Enable RLS on StockMovement
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on StockMovement");

    // Create RLS policy for StockMovement
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_stock_movement ON "StockMovement"`);
    } catch (e) {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_stock_movement ON "StockMovement"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for StockMovement");

    console.log("\n✅ All RLS policies applied successfully!");
  } catch (error: any) {
    // Check if policies already exist (that's okay)
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("⚠️  Policies may already exist, continuing...");
    } else {
      console.error("❌ Error applying RLS policies:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyRLSPolicies()
  .then(() => {
    console.log("\n🎉 RLS setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to apply RLS policies:", error);
    process.exit(1);
  });

