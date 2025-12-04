/**
 * Test script for Phase 4.4 PO Reports
 *
 * Tests:
 * 1. PO Status Report - Summary grouped by status
 * 2. PO vs Receipt Report - Ordered vs received quantities
 */

import { PrismaClient } from "../generated/prisma";
import {
  getStatusReport,
  getPoVsReceiptReport,
} from "../services/purchaseOrder.service";

const prisma = new PrismaClient();

const TEST_TENANT_ID = process.env.TEST_TENANT_ID || "dc7e2af3-7f7c-4b87-bff0-ffa76c525646";

async function ensureTestData(tenantId: string) {
  await prisma.$executeRawUnsafe(`SET app.current_tenant_id = '${tenantId}'`);

  // Ensure we have at least one PO with different statuses
  const pos = await prisma.purchaseOrder.findMany({
    where: {
      tenantId,
      deletedAt: null,
    },
    take: 1,
  });

  if (pos.length === 0) {
    console.log("⚠️  No POs found for testing. Please run test-purchase-orders.ts first.");
    return false;
  }

  return true;
}

async function main() {
  try {
    console.log("🧪 Starting PO Reports tests (4.4)...\n");
    console.log(`📋 Using test tenant: ${TEST_TENANT_ID}\n`);

    const hasData = await ensureTestData(TEST_TENANT_ID);
    if (!hasData) {
      process.exit(1);
    }

    // Test 1: Status Report
    console.log("📊 Test 1: PO Status Report ...");
    const statusReport = await getStatusReport(TEST_TENANT_ID);
    console.log(`  ✅ Status Summary:`);
    statusReport.statusSummary.forEach((summary) => {
      console.log(
        `    - ${summary.status}: ${summary.count} PO(s), Total: ${summary.totalAmount.toFixed(2)}`
      );
    });
    console.log(
      `  ✅ Total: ${statusReport.totalCount} PO(s), Grand Total: ${statusReport.totalAmount.toFixed(2)}\n`
    );

    // Test 2: PO vs Receipt Report
    console.log("📦 Test 2: PO vs Receipt Report ...");
    const receiptReport = await getPoVsReceiptReport(TEST_TENANT_ID);
    console.log(`  ✅ Found ${receiptReport.purchaseOrders.length} PO(s) in report`);
    console.log(`  ✅ Summary:`);
    console.log(
      `    - Total POs: ${receiptReport.summary.totalPos}`
    );
    console.log(
      `    - Total Ordered: ${receiptReport.summary.totalOrdered} units`
    );
    console.log(
      `    - Total Received: ${receiptReport.summary.totalReceived} units`
    );
    console.log(
      `    - Overall Receipt %: ${receiptReport.summary.overallReceiptPercentage.toFixed(2)}%`
    );

    if (receiptReport.purchaseOrders.length > 0) {
      const firstPo = receiptReport.purchaseOrders[0];
      console.log(`\n  ✅ Sample PO: ${firstPo.poNumber}`);
      console.log(
        `    - Status: ${firstPo.status}`
      );
      console.log(
        `    - Ordered: ${firstPo.totalOrdered} units, Received: ${firstPo.totalReceived} units`
      );
      console.log(
        `    - Receipt %: ${firstPo.receiptPercentage.toFixed(2)}%`
      );
      if (firstPo.lines.length > 0) {
        console.log(`    - Lines: ${firstPo.lines.length} line item(s)`);
      }
    }

    console.log("\n✅ All 4.4 PO Reports tests completed successfully!");
  } catch (error: any) {
    console.error("\n❌ PO Reports tests failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



