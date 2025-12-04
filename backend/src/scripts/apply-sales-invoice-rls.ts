/**
 * Apply RLS Policies for Sales Invoice Tables
 *
 * This script applies Row-Level Security policies to the sales invoice tables
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function applySalesInvoiceRLSPolicies() {
  console.log("🔒 Applying RLS policies for SalesInvoice tables...\n");

  try {
    // Enable RLS on SalesInvoice
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SalesInvoice" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on SalesInvoice");

    // Create RLS policy for SalesInvoice
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_sales_invoice ON "SalesInvoice"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_sales_invoice ON "SalesInvoice"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for SalesInvoice");

    // Enable RLS on SalesInvoiceLine
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SalesInvoiceLine" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on SalesInvoiceLine");

    // Create RLS policy for SalesInvoiceLine
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_sales_invoice_line ON "SalesInvoiceLine"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_sales_invoice_line ON "SalesInvoiceLine"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for SalesInvoiceLine");

    console.log("\n✅ Sales invoice RLS policies applied successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("⚠️  Policies may already exist, continuing...");
    } else {
      console.error("❌ Error applying sales invoice RLS policies:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applySalesInvoiceRLSPolicies()
  .then(() => {
    console.log("\n🎉 Sales invoice RLS setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to apply sales invoice RLS policies:", error);
    process.exit(1);
  });

