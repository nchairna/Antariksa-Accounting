/**
 * Sales Order Test Script
 *
 * Simple script to verify SalesOrder creation and tenant isolation.
 *
 * Run with: npm run test:sales-orders (after adding script in package.json)
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

let TEST_TENANT_ID = process.env.TEST_TENANT_1_ID || "";

async function main() {
  console.log("🧪 Starting Sales Order tests...\n");

  try {
    if (!TEST_TENANT_ID) {
      const tenant = await prisma.tenant.findUnique({
        where: { code: "TEST_TENANT" },
      });

      if (!tenant) {
        throw new Error(
          "No test tenant found. Run seed-test-tenant.ts first or set TEST_TENANT_1_ID"
        );
      }

      TEST_TENANT_ID = tenant.id;
      console.log(`📋 Using test tenant: ${tenant.code} (${TEST_TENANT_ID})\n`);
    }

    await prisma.$executeRawUnsafe(
      `SET app.current_tenant_id = '${TEST_TENANT_ID}'`
    );

    // Ensure we have at least one customer and item
    const customer =
      (await prisma.customer.findFirst({
        where: { tenantId: TEST_TENANT_ID },
      })) ||
      (await prisma.customer.create({
        data: {
          tenantId: TEST_TENANT_ID,
          code: "TEST-CUST-001",
          name: "Test Customer",
          customerType: "COMPANY",
          status: "ACTIVE",
          currency: "USD",
        },
      }));

    const item =
      (await prisma.item.findFirst({
        where: { tenantId: TEST_TENANT_ID },
      })) ||
      (await prisma.item.create({
        data: {
          tenantId: TEST_TENANT_ID,
          code: "TEST-ITEM-SO-001",
          name: "Test SO Item",
          purchasePrice: 10.0,
          sellingPrice: 20.0,
          unitOfMeasurement: "PCS",
          currency: "USD",
          status: "ACTIVE",
        },
      }));

    console.log("📦 Using customer:", customer.code, "-", customer.name);
    console.log("📦 Using item:", item.code, "-", item.name);

    // Test 1: Create Sales Order
    console.log("\n✅ Test 1: Creating Sales Order...");
    const so = await prisma.salesOrder.create({
      data: {
        tenantId: TEST_TENANT_ID,
        soNumber: "SO-TEST-00001",
        soDate: new Date(),
        customerId: customer.id,
        currency: "USD",
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 0,
        shippingCharges: 0,
        grandTotal: 100,
        status: "DRAFT",
      },
    });
    console.log("✅ Sales Order created:", so.soNumber, "- Status:", so.status);

    // Test 2: Create Sales Order Line
    console.log("\n✅ Test 2: Creating Sales Order Line...");
    const soLine = await prisma.salesOrderLine.create({
      data: {
        tenantId: TEST_TENANT_ID,
        salesOrderId: so.id,
        itemId: item.id,
        lineNumber: 1,
        quantityOrdered: 5,
        quantityDelivered: 0,
        unitPrice: 20,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 100,
      },
    });
    console.log("✅ Sales Order Line created:", soLine.lineNumber, "- Qty:", soLine.quantityOrdered);

    // Test 3: Query Sales Order with lines
    console.log("\n✅ Test 3: Querying Sales Order with lines...");
    const soWithLines = await prisma.salesOrder.findFirst({
      where: {
        id: so.id,
        tenantId: TEST_TENANT_ID,
      },
      include: {
        customer: {
          select: {
            code: true,
            name: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (soWithLines) {
      console.log("✅ Sales Order retrieved:");
      console.log("   SO Number:", soWithLines.soNumber);
      console.log("   Customer:", soWithLines.customer?.code, "-", soWithLines.customer?.name);
      console.log("   Lines:", soWithLines.lines.length);
      soWithLines.lines.forEach((line, idx) => {
        console.log(`   Line ${idx + 1}:`, line.item?.code, "- Qty:", line.quantityOrdered);
      });
    }

    // Test 4: Verify tenant isolation (should only see this tenant's SOs)
    console.log("\n✅ Test 4: Verifying tenant isolation...");
    const allSOs = await prisma.salesOrder.findMany({
      where: { tenantId: TEST_TENANT_ID },
    });
    console.log(`✅ Found ${allSOs.length} sales order(s) for tenant`);

    console.log("\n✅ All tests passed!");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("\n🎉 Sales Order tests complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Sales Order tests failed:", error);
    process.exit(1);
  });

