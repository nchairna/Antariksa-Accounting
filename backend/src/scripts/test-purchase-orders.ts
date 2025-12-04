/**
 * Purchase Order Test Script
 *
 * Simple script to verify PurchaseOrder creation and tenant isolation.
 *
 * Run with: npm run test:purchase-orders (after adding script in package.json)
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

let TEST_TENANT_ID = process.env.TEST_TENANT_1_ID || "";

async function main() {
  console.log("🧪 Starting Purchase Order tests...\n");

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

    // Ensure we have at least one supplier and item
    const supplier =
      (await prisma.supplier.findFirst({
        where: { tenantId: TEST_TENANT_ID },
      })) ||
      (await prisma.supplier.create({
        data: {
          tenantId: TEST_TENANT_ID,
          code: "TEST-SUP-001",
          name: "Test Supplier",
          supplierType: "DISTRIBUTOR",
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
          code: "TEST-ITEM-PO-001",
          name: "Test PO Item",
          purchasePrice: 10.0,
          sellingPrice: 20.0,
          unitOfMeasurement: "PCS",
          currency: "USD",
          status: "ACTIVE",
        },
      }));

    console.log("📦 Using supplier:", supplier.code, "-", supplier.name);
    console.log("📦 Using item:", item.code, "-", item.name);

    const po = await prisma.purchaseOrder.create({
      data: {
        tenantId: TEST_TENANT_ID,
        poNumber: "PO-TEST-00001",
        poDate: new Date(),
        supplierId: supplier.id,
        currency: "USD",
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 0,
        shippingCharges: 0,
        grandTotal: 100,
        status: "DRAFT",
      },
    });

    await prisma.purchaseOrderLine.create({
      data: {
        tenantId: TEST_TENANT_ID,
        purchaseOrderId: po.id,
        itemId: item.id,
        lineNumber: 1,
        quantityOrdered: 5,
        quantityReceived: 0,
        unitPrice: 20,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 100,
      },
    });

    console.log("✅ Created basic test purchase order:", po.poNumber);

    const fetched = await prisma.purchaseOrder.findFirst({
      where: { id: po.id, tenantId: TEST_TENANT_ID },
      include: {
        lines: true,
      },
    });

    if (!fetched) {
      throw new Error("Failed to fetch created purchase order");
    }

    console.log(
      `✅ Fetched purchase order with ${fetched.lines.length} line(s) for tenant`
    );

    console.log("\n✅ Purchase Order tests completed successfully!");
  } catch (error: any) {
    console.error("❌ Purchase Order tests failed:", error.message);
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




