/**
 * Apply RLS Policies for Payment Tables
 *
 * This script applies Row-Level Security policies to the payment tables
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function applyPaymentRLSPolicies() {
  console.log("🔒 Applying RLS policies for Payment tables...\n");

  try {
    // Enable RLS on Payment
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on Payment");

    // Create RLS policy for Payment
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_payment ON "Payment"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_payment ON "Payment"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for Payment");

    // Enable RLS on PaymentAllocation
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PaymentAllocation" ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled RLS on PaymentAllocation");

    // Create RLS policy for PaymentAllocation
    try {
      await prisma.$executeRawUnsafe(
        `DROP POLICY IF EXISTS tenant_isolation_payment_allocation ON "PaymentAllocation"`
      );
    } catch {
      // Ignore if policy doesn't exist
    }
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_payment_allocation ON "PaymentAllocation"
        FOR ALL
        USING ("tenantId" = get_current_tenant_id()::TEXT)
        WITH CHECK ("tenantId" = get_current_tenant_id()::TEXT)
    `);
    console.log("✅ Created RLS policy for PaymentAllocation");

    console.log("\n✅ Payment RLS policies applied successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("⚠️  Policies may already exist, continuing...");
    } else {
      console.error("❌ Error applying payment RLS policies:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyPaymentRLSPolicies()
  .then(() => {
    console.log("\n🎉 Payment RLS setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to apply payment RLS policies:", error);
    process.exit(1);
  });

