/**
 * Apply RLS Policies for Purchase Invoice Tables
 *
 * This script applies Row-Level Security policies to the purchase invoice tables
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function applyPurchaseInvoiceRLSPolicies() {
  console.log("🔒 Applying RLS policies for PurchaseInvoice tables...\n");

  try {
    // Enable RLS on PurchaseInvoice
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PurchaseInvoice" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on PurchaseInvoice");

    // Create RLS policy for PurchaseInvoice
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_purchase_invoice ON "PurchaseInvoice"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_purchase_invoice ON "PurchaseInvoice"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for PurchaseInvoice");

    // Enable RLS on PurchaseInvoiceLine
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PurchaseInvoiceLine" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on PurchaseInvoiceLine");

    // Create RLS policy for PurchaseInvoiceLine
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_purchase_invoice_line ON "PurchaseInvoiceLine"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_purchase_invoice_line ON "PurchaseInvoiceLine"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for PurchaseInvoiceLine");

    console.log("\n✅ Purchase invoice RLS policies applied successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("⚠️  Policies may already exist, continuing...");
    } else {
      console.error("❌ Error applying purchase invoice RLS policies:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyPurchaseInvoiceRLSPolicies()
  .then(() => {
    console.log("\n🎉 Purchase invoice RLS setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to apply purchase invoice RLS policies:", error);
    process.exit(1);
  });

